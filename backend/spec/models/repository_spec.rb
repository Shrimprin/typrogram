# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Repository, type: :model do
  let(:node_class) { Struct.new(:path, :type, :children, keyword_init: true) }

  describe '#file_items_grouped_by_parent' do
    let(:repository) { build(:repository) }

    context 'when no file_items exist' do
      it 'returns empty hash' do
        expect(repository.file_items_grouped_by_parent).to be_empty
      end
    end

    context 'when only root level file_items' do
      let!(:readme_file) { create(:file_item, repository:, parent: nil) }
      let!(:license_file) { create(:file_item, repository:, parent: nil) }
      let!(:src_directory) { create(:file_item, :directory, repository:, parent: nil) }

      it 'groups all file_items under nil key' do
        result = repository.file_items_grouped_by_parent

        expect(result.keys).to eq([nil])
        expect(result[nil]).to contain_exactly(readme_file, license_file, src_directory)
      end
    end

    context 'when nested file structure' do
      let!(:root_dir) { create(:file_item, :directory, repository:, parent: nil) }
      let!(:sub_dir) { create(:file_item, :directory, repository:, parent: root_dir) }
      let!(:readme_file) { create(:file_item, repository:, parent: nil) }
      let!(:main_file) { create(:file_item, repository:, parent: nil) }
      let!(:controller_file) { create(:file_item, repository:, parent: root_dir) }
      let!(:model_file) { create(:file_item, repository:, parent: root_dir) }
      let!(:config_file) { create(:file_item, repository:, parent: sub_dir) }

      it 'groups file_items by their parent_id correctly' do
        result = repository.file_items_grouped_by_parent

        expect(result.keys).to contain_exactly(nil, root_dir.id, sub_dir.id)
        expect(result[nil]).to contain_exactly(root_dir, readme_file, main_file)
        expect(result[root_dir.id]).to contain_exactly(sub_dir, controller_file, model_file)
        expect(result[sub_dir.id]).to contain_exactly(config_file)
      end
    end

    context 'when multiple children under same parent' do
      let!(:parent_dir) { create(:file_item, :directory, repository:, parent: nil) }
      let!(:service_file) { create(:file_item, repository:, parent: parent_dir) }
      let!(:helper_file) { create(:file_item, repository:, parent: parent_dir) }
      let!(:utils_directory) { create(:file_item, :directory, repository:, parent: parent_dir) }

      it 'groups multiple children under the same parent_id' do
        result = repository.file_items_grouped_by_parent

        expect(result[parent_dir.id]).to contain_exactly(service_file, helper_file, utils_directory)
      end
    end
  end

  describe '#progress' do
    let(:repository) { create(:repository) }

    context 'when no file_items exist' do
      it 'returns 1.0' do
        expect(repository.progress).to eq(1.0)
      end
    end

    context 'when some files are typed (50%)' do
      it 'returns 0.5' do
        create(:file_item, :typed, repository:)
        create(:file_item, repository:, status: :untyped)

        expect(repository.progress).to eq(0.5)
      end
    end

    context 'when all files are typed (100%)' do
      it 'returns 1.0' do
        create(:file_item, :typed, repository:)
        create(:file_item, :typed, repository:)

        expect(repository.progress).to eq(1.0)
      end
    end

    context 'when some files are unsupported (50%)' do
      it 'returns 0.5' do
        create(:file_item, repository:, status: :unsupported)
        create(:file_item, repository:, status: :untyped)

        expect(repository.progress).to eq(0.5)
      end
    end
  end

  describe '#save_with_file_items' do
    let(:repository) { build(:repository) }
    let(:github_client_mock) { instance_double(Octokit::Client) }

    context 'when saved successfully' do
      before do
        allow(repository).to receive(:save).and_return(true)
        allow(repository).to receive(:save_file_items).with(github_client_mock).and_return(true)
      end

      it 'returns true' do
        expect(repository.save_with_file_items(github_client_mock)).to be true
      end
    end

    context 'when save failed' do
      before do
        allow(repository).to receive(:save).and_return(false)
        allow(repository).to receive(:save_file_items).with(github_client_mock).and_return(true)
      end

      it 'returns nil' do
        expect(repository.save_with_file_items(github_client_mock)).to be_nil
      end

      it 'does not create a repository' do
        expect do
          repository.save_with_file_items(github_client_mock)
        end.not_to change(described_class, :count)
      end
    end

    context 'when save_file_items failed' do
      before do
        allow(repository).to receive(:save).and_return(true)
        allow(repository).to receive(:save_file_items).with(github_client_mock).and_return(false)
      end

      it 'returns nil' do
        expect(repository.save_with_file_items(github_client_mock)).to be_nil
      end

      it 'rolls backs the transaction and does not create a repository' do
        expect do
          repository.save_with_file_items(github_client_mock)
        end.not_to change(described_class, :count)
      end
    end
  end

  describe '#save_file_items' do
    let(:repository) { create(:repository, :with_extensions) }
    let(:file_tree) do
      [
        node_class.new(path: 'file1.rb', type: 'blob'),
        node_class.new(path: 'file2.rb', type: 'blob'),
        node_class.new(path: 'directory1', type: 'tree'),
        node_class.new(path: 'directory1/file3.rb', type: 'blob'),
        node_class.new(path: 'directory1/directory2', type: 'tree'),
        node_class.new(path: 'directory1/directory2/file4.rb', type: 'blob'),
        node_class.new(path: 'inactive_directory', type: 'tree'),
        node_class.new(path: 'inactive_directory/inactive_file.md', type: 'blob')
      ]
    end
    let(:github_client_mock) { instance_double(Octokit::Client) }
    let(:tree_response) { double('tree_response', tree: file_tree) }

    before do
      allow(github_client_mock).to receive(:tree)
        .with(repository.url, repository.commit_hash, recursive: true)
        .and_return(tree_response)
    end

    it 'saves file_items with tree structure' do
      expect(repository.file_items.count).to be_zero
      repository.send(:save_file_items, github_client_mock)

      expect(repository.file_items.count).to eq(6)
      expect(repository.file_items.where(type: 'file').count).to eq(4)
      expect(repository.file_items.where(type: 'dir').count).to eq(2)

      root_directory = repository.file_items.find_by(path: 'directory1')
      expect(root_directory.parent_id).to be_nil
      expect(root_directory.children.count).to eq(2)

      child_file = root_directory.children.find_by(path: 'directory1/file3.rb')
      expect(child_file.parent_id).to eq(root_directory.id)

      child_directory = root_directory.children.find_by(path: 'directory1/directory2')
      expect(child_directory.parent_id).to eq(root_directory.id)
      expect(child_directory.children.count).to eq(1)

      grandchild_file = child_directory.children.find_by(path: 'directory1/directory2/file4.rb')
      expect(grandchild_file.parent_id).to eq(child_directory.id)
    end

    it 'does not save file_items with inactive extensions' do
      expect(repository.extensions.find_by(name: '.md').is_active).to be false
      repository.send(:save_file_items, github_client_mock)

      inactive_directory = repository.file_items.find_by(path: 'inactive_directory')
      expect(inactive_directory).to be_nil

      inactive_file = repository.file_items.find_by(path: 'inactive_directory/inactive_file.md')
      expect(inactive_file).to be_nil
    end
  end

  describe '#filter_file_tree_by_valid_extensions' do
    let(:repository) { create(:repository, :with_extensions) }
    let(:file_tree_grouped_by_depth) do
      {
        0 => [node_class.new(path: 'root_file.rb', type: 'blob'),
              node_class.new(path: 'root_directory', type: 'tree'),
              node_class.new(path: 'inactive_directory', type: 'tree')],
        1 => [node_class.new(path: 'root_directory/child_file.rb', type: 'blob'),
              node_class.new(path: 'root_directory/child_directory', type: 'tree'),
              node_class.new(path: 'inactive_directory/inactive_file.md', type: 'blob')],
        2 => [node_class.new(path: 'root_directory/child_directory/grandchild_file.rb', type: 'blob')]
      }
    end

    it 'filters file_items with valid extensions' do
      result = repository.send(:filter_file_tree_by_valid_extensions, file_tree_grouped_by_depth)

      root_file = result.find { |node| node.path == 'root_file.rb' }
      expect(root_file).to be_present

      root_directory = result.find { |node| node.path == 'root_directory' }
      expect(root_directory).to be_present

      children = root_directory.children
      expect(children.count).to eq(2)

      child_file = children.find { |node| node.path == 'root_directory/child_file.rb' }
      expect(child_file).to be_present

      child_directory = children.find { |node| node.path == 'root_directory/child_directory' }
      expect(child_directory).to be_present

      grandchildren = child_directory.children
      expect(grandchildren.count).to eq(1)

      grandchild_file = grandchildren.find { |node| node.path == 'root_directory/child_directory/grandchild_file.rb' }
      expect(grandchild_file).to be_present

      inactive_file = result.find { |node| node.path == 'inactive_directory/inactive_file.md' }
      expect(inactive_file).to be_nil

      inactive_directory = result.find { |node| node.path == 'inactive_directory' }
      expect(inactive_directory).to be_nil
    end
  end

  describe '#create_file_items_recursively' do
    let(:repository) { create(:repository) }

    context 'when valid file_tree is given' do
      let(:file_tree) do
        [
          node_class.new(path: 'root_file.rb', type: 'blob'),
          node_class.new(path: 'root_directory', type: 'tree', children: [
                           node_class.new(path: 'root_directory/child_file.rb', type: 'blob'),
                           node_class.new(path: 'root_directory/child_directory', type: 'tree', children: [
                                            node_class.new(path: 'root_directory/child_directory/grandchild_file.rb',
                                                           type: 'blob')
                                          ])
                         ])
        ]
      end

      it 'creates file_items with tree structure' do
        expect(repository.file_items.count).to be_zero
        repository.send(:create_file_items_recursively, file_tree)

        expect(repository.file_items.count).to eq(5)
        expect(repository.file_items.where(type: 'file').count).to eq(3)
        expect(repository.file_items.where(type: 'dir').count).to eq(2)

        root_file = repository.file_items.find_by(path: 'root_file.rb')
        expect(root_file.parent_id).to be_nil

        root_directory = repository.file_items.find_by(path: 'root_directory')
        expect(root_directory.parent_id).to be_nil

        child_file = root_directory.children.find_by(path: 'root_directory/child_file.rb')
        expect(child_file.parent_id).to eq(root_directory.id)

        child_directory = root_directory.children.find_by(path: 'root_directory/child_directory')
        expect(child_directory.parent_id).to eq(root_directory.id)

        grandchild_file = child_directory.children.find_by(path: 'root_directory/child_directory/grandchild_file.rb')
        expect(grandchild_file.parent_id).to eq(child_directory.id)
      end
    end

    context 'when invalid file_tree is given' do
      let(:file_tree) do
        [
          node_class.new(path: '', type: 'blob')
        ]
      end

      it 'returns nil' do
        expect(repository.send(:create_file_items_recursively, file_tree)).to be_nil
      end

      it 'does not create file_items' do
        expect(repository.file_items.count).to be_zero
        repository.send(:create_file_items_recursively, file_tree)

        expect(repository.file_items.count).to be_zero
      end

      it 'adds errors to the repository' do
        repository.send(:create_file_items_recursively, file_tree)

        expect(repository.errors['file_item.name']).to include("can't be blank")
        expect(repository.errors['file_item.path']).to include("can't be blank")
      end
    end
  end

  describe '#build_file_items' do
    let(:repository) { create(:repository) }
    let(:parent_file_item) { create(:file_item, repository:) }
    let(:file_tree) do
      [
        node_class.new(path: 'root_file.rb', type: 'blob'),
        node_class.new(path: 'root_directory', type: 'tree')
      ]
    end

    it 'builds file_items with correct attributes' do
      result = repository.send(:build_file_items, file_tree, parent_file_item)

      expect(result.size).to eq(2)

      root_file = result.find { |file_item| file_item.path == 'root_file.rb' }
      root_directory = result.find { |file_item| file_item.path == 'root_directory' }

      expect(root_file).to be_a(FileItem)
      expect(root_file.repository).to eq(repository)
      expect(root_file.parent).to eq(parent_file_item)
      expect(root_file.name).to eq('root_file.rb')
      expect(root_file.path).to eq('root_file.rb')
      expect(root_file).to be_file
      expect(root_file).to be_untyped
      expect(root_file.content).to be_nil

      expect(root_directory).to be_a(FileItem)
      expect(root_directory.repository).to eq(repository)
      expect(root_directory.parent).to eq(parent_file_item)
      expect(root_directory.name).to eq('root_directory')
      expect(root_directory.path).to eq('root_directory')
      expect(root_directory).to be_dir
      expect(root_directory).to be_untyped
      expect(root_directory.content).to be_nil
    end
  end

  describe '#active?' do
    let(:repository) { create(:repository, :with_extensions) }

    context 'when file_item has valid extension' do
      let(:valid_node) { node_class.new(path: 'valid_file.rb', type: 'blob') }

      it 'returns true' do
        expect(repository.send(:active?, valid_node)).to be true
      end
    end

    context 'when file_item has inactive extension' do
      let(:inactive_node) { node_class.new(path: 'inactive_file.md', type: 'blob') }

      it 'returns false' do
        expect(repository.send(:active?, inactive_node)).to be false
      end
    end
  end

  describe '#children_of' do
    let(:repository) { create(:repository, :with_extensions) }
    let(:file_tree_grouped_by_depth) do
      {
        0 => [node_class.new(path: 'root_file.rb', type: 'blob'),
              node_class.new(path: 'root_directory', type: 'tree'),
              node_class.new(path: 'inactive_directory', type: 'tree')],
        1 => [node_class.new(path: 'root_directory/child_file.rb', type: 'blob'),
              node_class.new(path: 'root_directory/child_directory', type: 'tree'),
              node_class.new(path: 'inactive_directory/inactive_file.md', type: 'blob')],
        2 => [node_class.new(path: 'root_directory/child_directory/grandchild_file.rb', type: 'blob')]
      }
    end

    context 'when parent_node has children' do
      it 'returns children of the given node' do
        result = repository.send(:children_of, file_tree_grouped_by_depth, 'root_directory/')

        expect(result.count).to eq(2)

        child_file = result.find { |node| node.path == 'root_directory/child_file.rb' }
        child_directory = result.find { |node| node.path == 'root_directory/child_directory' }
        expect(child_file).to be_present
        expect(child_directory).to be_present
      end
    end

    context 'when parent_node has no children' do
      it 'returns empty array' do
        expect(repository.send(:children_of, file_tree_grouped_by_depth, 'root_file.rb')).to be_empty
      end
    end
  end

  describe '#depth_of' do
    let(:repository) { build(:repository) }

    it 'calculates path depth correctly' do
      expect(repository.send(:depth_of, 'file.rb')).to be_zero
      expect(repository.send(:depth_of, 'src/main.rb')).to eq(1)
      expect(repository.send(:depth_of, 'src/lib/helper.rb')).to eq(2)
    end
  end
end
