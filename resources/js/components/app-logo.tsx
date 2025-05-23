import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center">
                <AppLogoIcon className="size-7 fill-current text-black dark:text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold text-[#47859e]">Sky Nature Park</span>
            </div>
        </>
    );
}
