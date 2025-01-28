'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useCurrentLocale } from 'next-i18n-router/client';
import i18nConfig from '@/app/i18nConfig';
import {Menu, Transition} from "@headlessui/react";
import { Fragment } from 'react'
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
export default function LanguageChanger() {
  const router = useRouter();
  const currentPathname = usePathname();
  const currentLocale = useCurrentLocale(i18nConfig);

  const handleChange = locale => {
    const newLocale = locale;

    // set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    if (currentLocale === i18nConfig.defaultLocale && !i18nConfig.prefixDefault) {
      router.push('/' + newLocale + currentPathname);
    } else {
      router.push(currentPathname.replace(`/${currentLocale}`, `/${newLocale}`));
    }

    router.refresh();
  };

  const FlagIcon = ({countryCode}) => {
    if (countryCode==="en") countryCode = "gb"
    return <span className={`fi fis fiCircle inline-block mr-2 fi-${countryCode}`} />
  }

  return (<Menu as="div" className="relative dark:text-gray-50">
    <>
      <Menu.Button className="flex rounded-full text-sm">
        <span className="sr-only">Open user menu</span>
        <FlagIcon countryCode={currentLocale}/>
        {currentLocale.toUpperCase()}
        <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
        >
          <path
              fillRule="evenodd"
              d="M10.293 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4z"
              clipRule="evenodd"
          />
        </svg>
      </Menu.Button>
    </>
    <Transition
        as={Fragment}
        enter="transition ease-out duration-700"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white dark:bg-gray-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        {i18nConfig.locales.map(language=>(
            <button
                key={language}
                onClick={()=>handleChange(language)}
                className={classNames(currentLocale === language ? 'bg-gray-600' : '', 'block px-4 py-2 text-sm text-gray-700 dark:text-gray-50')}
            >
              <FlagIcon countryCode={language}/>

              <span className="truncate">{language.toUpperCase()}</span>
            </button>
        ))}
      </Menu.Items>
    </Transition>
  </Menu>);
}