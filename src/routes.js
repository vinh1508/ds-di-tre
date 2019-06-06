import MainView from "./screens/MainView";
import Home from "./screens/Home";
import NotFoundPage from "./screens/NotFoundPage";

export default [
    {
        path: "/",
        component: Home
    },
    {
        path: "/not-found",
        component: NotFoundPage
    },

];
