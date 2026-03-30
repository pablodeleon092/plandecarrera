import { Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';

export default function ListHeader({ title, buttonLabel, buttonRoute }) {
    return (
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {buttonRoute && (
                <Link
                    href={buttonRoute}
                >
                    <PrimaryButton>
                        {buttonLabel}
                    </PrimaryButton>
                </Link>
            )}
        </div>
    );
}
