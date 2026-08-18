import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import type { User } from "../models/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Rocket } from "lucide-react";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [isSubmit, setIsSubmit] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmit(true);
        try {
            const response = await axios.post<{ data: User }>("/api/auth", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 200) {
                // Handle successful login
                const data: User = response.data.data;

                // Store the token in local storage
                localStorage.setItem("access_token", data.auth_token);
                localStorage.setItem("refresh_token", data.refresh);
                localStorage.setItem("user", JSON.stringify({
                    id: data.id,
                    username: data.username,
                    full_name: data.full_name,
                    email: data.email,
                    uuid: data.uuid,
                }));

                // Redirect to the projects page
                navigate("/projects");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Handle Axios error
                console.error("Axios error:", error);
                setError(error.response?.data?.message || "An error occurred");
            } else {
                // Handle non-Axios error
                console.error("Unexpected error:", error);
                setError("An unexpected error occurred");
            }
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative">
            <div className="w-full max-w-md relative z-10">
                {/* Glowing orbs behind the login card to enhance glassmorphism */}
                <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -z-10 animate-pulse duration-1000" />
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -z-10 animate-pulse duration-1000 delay-500" />

                <Card className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-black/5">
                    <CardHeader className="text-center pt-10 pb-4">
                        <div className="mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20">
                            <Rocket className="text-white w-8 h-8" />
                        </div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">
                            Taiga Points
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-2 text-base font-medium">
                            Sign in to access your workspace
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-10 md:px-10">
                        {error && (
                            <Alert variant="destructive" className="mb-6 bg-red-50/80 backdrop-blur-sm border-red-200 text-red-800 rounded-xl">
                                <AlertDescription>
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-gray-700 font-semibold ml-1">Email / Username</Label>
                                    <Input
                                        id="email"
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white/60 backdrop-blur-sm border-white/60 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl px-4 shadow-sm"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white/60 backdrop-blur-sm border-white/60 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl px-4 shadow-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-14 mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-colors duration-300 rounded-xl text-lg font-bold cursor-pointer"
                                    disabled={isSubmit}
                                    onClick={() => {
                                        setError(null);
                                    }}
                                >
                                    {isSubmit ? "Signing In..." : "Sign In"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Login