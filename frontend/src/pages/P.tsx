import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function P() {
    return (
        <div className="w-full min-h-screen bg-gray-200">
            <div className="container mx-auto p-6">
                <Card className="max-w-full mx-auto bg-gray-100 shadow-lg pt-0">
                    <CardHeader className="bg-white py-4 rounded-t-xl">
                        <h1 className="text-xl font-bold">P Component</h1>
                        <p className="text-gray-600">This is a placeholder page for the P component.</p>
                    </CardHeader>

                    <CardContent className="p-6 bg-gray-100">
                        <h1 className="text-2xl font-bold mb-4">Welcome to P</h1>
                        <p className="text-gray-700">
                            This is a placeholder page for the P component. You can add your content here.
                        </p>
                        <p className="text-gray-500 mt-2">
                            This page is currently under construction.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}