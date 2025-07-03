import { redirect } from "react-router";
import { isAuthenticated } from "./auth";

export function protectedLoader() {
    if (!isAuthenticated()) {
        return redirect("/auth");
    }

    return null;
}