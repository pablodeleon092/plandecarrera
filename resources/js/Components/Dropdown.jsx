import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useMemo, useState } from 'react';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={useMemo(() => ({ open, setOpen, toggleOpen }), [open])}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                onClick={toggleOpen}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOpen(); } }}
            >{children}</div>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                    onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
                    role="presentation"
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-white',
    children,
}) => {
    const { open, setOpen } = useContext(DropDownContext);

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <>
            <Transition
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={`dropdown-content-container ${alignmentClasses} ${widthClasses}`}
                    onClick={() => setOpen(false)}
                    onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); e.stopPropagation(); } }}
                    role="menu"
                    tabIndex={-1}
                >
                    <div
                        className={`dropdown-content-inner ${contentClasses}`}
                    >
                        {children}
                    </div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={`dropdown-link ${className}`.trim()}
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
