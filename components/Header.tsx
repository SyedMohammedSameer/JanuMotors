
import React from 'react';
import { useMatches, Link } from 'react-router-dom';
import { UserCircleIcon } from './Icons';

// This type is now correctly defined to be a subtype of the match object from useMatches.
// It uses an intersection to add the specific `crumb` property to the handle.
type MatchWithCrumb = ReturnType<typeof useMatches>[number] & {
    handle: {
        crumb: string;
    }
}

const Header = () => {
    const matches = useMatches();
    const crumbs = matches
        // The type predicate `is MatchWithCrumb` now works correctly,
        // which properly types the `crumbs` array.
        .filter((match): match is MatchWithCrumb =>
            Boolean(match.handle && (match.handle as any).crumb)
        );

  return (
    <header className="flex items-center justify-between h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-lg font-semibold">
          {crumbs.map((crumb, index) => (
            <li key={crumb.id} className="flex items-center">
              {index > 0 && <span className="mx-2 text-gray-400">/</span>}
              {index === crumbs.length - 1 ? (
                // `crumb.handle.crumb` is now correctly typed as string.
                <span className="text-gray-800 dark:text-white">{crumb.handle.crumb}</span>
              ) : (
                <Link to={crumb.pathname} className="text-primary-600 hover:underline dark:text-primary-400 dark:hover:text-primary-300">
                  {crumb.handle.crumb}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <div className="flex items-center">
        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300">
          <UserCircleIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
