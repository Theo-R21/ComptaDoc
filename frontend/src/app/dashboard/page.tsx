"use client";

import {useRouter} from "next/navigation";


export default function Dashboard() {
    const router = useRouter();
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState("");
    // const {refreshCurrentUser} = useCurrentUser();


    return (
        <main className="flex-1 p-8 space-y-8 overflow-auto">
            <header>
                <h1 className="text-2xl font-bold text-primary1">Dashboard</h1>
                <p className="text-primary2 ">
                    Gérer et consultez facilement les données de vos client
                </p>
            </header>


            <div className="grid grid-cols-1 text-center md:grid-cols-3 gap-6">
                <div className="h-32 bg-primary1 rounded-xl">bloc 1</div>
                <div className="h-32 bg-primary1 rounded-xl">bloc 2</div>
                <div className="h-32 bg-primary1 rounded-xl">bloc 3</div>
            </div>


            <div className="bg-primary1 rounded-xl h-96 flex items-center justify-center text-center">
                <p className="text-white text-2xl font-bold">
                    🕘En cour de développement🕘
                </p>
            </div>


            <div className="bg-primary1 rounded-xl h-50 text-center">bloc 4</div>


            <div className="bg-primary1 rounded-xl h-50 text-center">bloc 5</div>
        </main>
    );
}
