import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';

export default function Forbidden({ message }) {
    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        window.location.href = route('dashboard');
    };

    return (
        <>
            <Head title="Acceso restringido" />

            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-5 py-12 text-slate-900">
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1.5 bg-[#7a3035]"
                />
                <div
                    aria-hidden="true"
                    className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[64px] border-white/70"
                />
                <div
                    aria-hidden="true"
                    className="absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-slate-200/70"
                />

                <section className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-32px_rgba(15,23,42,0.4)]">
                    <div className="grid md:grid-cols-[10px_1fr]">
                        <div className="hidden bg-[#7a3035] md:block" />

                        <div className="px-7 py-8 sm:px-11 sm:py-10">
                            <Link
                                href={route('dashboard')}
                                aria-label="Ir al inicio"
                                className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a3035] focus:ring-offset-4"
                            >
                                <ApplicationLogo className="h-11 w-auto" />
                            </Link>

                            <div className="mt-12 flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#a5272d] ring-1 ring-red-100">
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-6 w-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v3.75m9.303-2.981c.703 5.138-2.174 9.905-7.303 11.73a6.995 6.995 0 0 1-4 0C4.87 19.674 1.994 14.907 2.697 9.769L3.45 4.263A2.25 2.25 0 0 1 5.679 2.32h12.642a2.25 2.25 0 0 1 2.229 1.943l.753 5.506Z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 16.5h.008v.008H12V16.5Z"
                                        />
                                    </svg>
                                </span>
                                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a3035]">
                                    Error 403
                                </span>
                            </div>

                            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                Acceso restringido
                            </h1>
                            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                                {message}
                            </p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                                >
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m15 18-6-6 6-6"
                                        />
                                    </svg>
                                    Volver a la página anterior
                                </button>

                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                                >
                                    Ir al inicio
                                </Link>
                            </div>

                            <p className="mt-9 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-500">
                                Si consideras que deberías tener acceso, comunícate con un administrador.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
