import { useEffect } from "react";

function SplashScreen({ onFinish }) {
    useEffect(() => {
        const timer = window.setTimeout(onFinish, 1800);
        return () => window.clearTimeout(timer);
    }, [onFinish]);

    return (
        <main className="grid min-h-screen place-items-center bg-[#0b0d0f]">
            <div className="grid size-24 place-items-center rounded-[2rem] bg-lime-300 text-5xl font-black text-[#0b0d0f]">
                U
            </div>
        </main>
    );
}

export default SplashScreen;
