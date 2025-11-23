# frozen_string_literal: true

Pagy.options[:limit] = 10
Pagy.options[:headers_map] = { page: 'Current-Page',
                            limit: 'Page-Items',
                            count: 'Total-Count',
                            pages: 'Total-Pages' }
