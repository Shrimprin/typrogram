# frozen_string_literal: true

class Repository < ApplicationRecord
  belongs_to :user
  has_many :file_items, dependent: :destroy
  has_many :extensions, dependent: :destroy

  accepts_nested_attributes_for :extensions, allow_destroy: true
  validates :commit_hash, :name, :url, presence: true

  BATCH_SIZE = 1000

  def file_items_grouped_by_parent
    file_items = self.file_items.to_a
    file_items.group_by(&:parent_id)
  end

  def progress
    files = file_items.where(type: :file)
    if files.empty?
      1.0
    else
      typed_count = files.where(status: %i[typed unsupported]).count
      typed_count.to_f / files.count
    end
  end

  def save_with_file_items(client)
    transaction do
      is_saved = save && save_file_items(client)
      raise ActiveRecord::Rollback unless is_saved

      true
    end
  end

  def destroy_with_associations
    transaction do
      delete_associated_records
      destroy
    end
  end

  private

  def save_file_items(client)
    file_tree_data = client.tree(url, commit_hash, recursive: true)
    file_tree_grouped_by_depth = file_tree_data.tree.group_by { |node| depth_of(node.path) }
    filtered_file_tree = filter_file_tree_by_valid_extensions(file_tree_grouped_by_depth)
    create_file_items_recursively(filtered_file_tree)
  end

  def filter_file_tree_by_valid_extensions(file_tree_grouped_by_depth, parent_node_path = '')
    nodes = children_of(file_tree_grouped_by_depth, parent_node_path)

    nodes.filter_map do |node|
      if node.type == 'tree'
        filtered_children = filter_file_tree_by_valid_extensions(file_tree_grouped_by_depth, "#{node.path}/")
        next if filtered_children.empty?

        node.children = filtered_children
        node
      elsif active?(node)
        node
      end
    end
  end

  def create_file_items_recursively(nodes, parent_file_item = nil)
    new_file_items = build_file_items(nodes, parent_file_item)
    result = FileItem.import(new_file_items, batch_size: BATCH_SIZE, timestamps: true)

    failed_file_items = result.failed_instances
    if failed_file_items.any?
      add_file_item_errors(failed_file_items)
      return nil
    end

    nodes.select { |node| node.type == 'tree' }.each do |node|
      parent_item = new_file_items.find { |item| item.path == node.path }
      create_file_items_recursively(node.children, parent_item)
    end
  end

  def add_file_item_errors(failed_file_items)
    failed_file_items.each do |failed_file_item|
      failed_file_item.errors.each do |error|
        errors.add("file_item.#{error.attribute}", error.message)
      end
    end
  end

  def build_file_items(nodes, parent_file_item)
    nodes.map do |node|
      FileItem.new(
        repository: self,
        parent: parent_file_item,
        name: File.basename(node.path),
        path: node.path,
        type: node.type == 'tree' ? :dir : :file,
        content: nil,
        status: :untyped
      )
    end
  end

  def delete_associated_records
    Typo.delete_by_repository(id)
    TypingProgress.delete_by_repository(id)
    file_items.delete_all
    extensions.delete_all
  end

  def active?(node)
    node_extension = Extension.extract_extension_name(node.path)
    extension = extensions.find { |ext| ext.name == node_extension }
    extension&.is_active || false
  end

  def children_of(file_tree_grouped_by_depth, parent_node_path)
    depth = depth_of(parent_node_path)
    nodes_by_depth = file_tree_grouped_by_depth[depth] || []
    nodes_by_depth.select do |node|
      node.path.start_with?(parent_node_path) && node.path != parent_node_path
    end
  end

  def depth_of(path)
    path.count('/')
  end
end
