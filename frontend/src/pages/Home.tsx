import { NavLink } from "react-router";

function Home() {
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <p>This is the home page of our application.</p>
            <NavLink to="/auth">
                Go to Login
            </NavLink>
        </div>
    );
}

export default Home;