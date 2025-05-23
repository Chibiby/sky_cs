import React from 'react';
import { Link } from '@inertiajs/react';

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationProps {
  links: PaginationLink[];
  from: number;
  to: number;
  total: number;
}

const Pagination: React.FC<PaginationProps> = ({ links, from, to, total }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 justify-between sm:hidden">
        {links.length > 3 && (
          <>
            <Link
              href={links[0].url || '#'}
              className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
                links[0].url
                  ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
            >
              Previous
            </Link>
            <Link
              href={links[links.length - 1].url || '#'}
              className={`relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
                links[links.length - 1].url
                  ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </Link>
          </>
        )}
      </div>
      <div className="hidden sm:flex sm:items-center">
        {links.length > 3 && (
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.url || '#'}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                  index === 0
                    ? 'rounded-l-md'
                    : index === links.length - 1
                    ? 'rounded-r-md'
                    : ''
                } ${
                  link.active
                    ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                    : link.url
                    ? 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                    : 'text-gray-300 ring-1 ring-inset ring-gray-300 cursor-not-allowed'
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};

export default Pagination; 