import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import type { User } from "../models/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";

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
                console.log("Login successful:", response.data);

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
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">

                <Card className="bg-white/70 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Welcome back</CardTitle>
                        <CardDescription>
                            Login with your Taiga account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-6">
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            className="focus-visible:ring-0"
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <div className="flex items-center">
                                            <Label htmlFor="password">Password</Label>
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="focus-visible:ring-0"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full cursor-pointer"
                                        disabled={isSubmit}
                                        onClick={() => {
                                            setError(null);
                                        }}
                                    >
                                        Login
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Login