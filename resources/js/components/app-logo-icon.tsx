import { ImgHTMLAttributes } from 'react';

interface AppLogoIconProps extends ImgHTMLAttributes<HTMLImageElement> {}

export default function AppLogoIcon(props: AppLogoIconProps) {
    return (
        <img
            src="/favicon.svg"  // Using favicon.svg instead of logo-wb.svg
            alt="Logo"
            {...props}  // Spread any additional props like className, width, height, etc.
        />
    );
}
