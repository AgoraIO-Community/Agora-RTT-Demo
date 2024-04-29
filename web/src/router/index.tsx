import { Suspense, lazy } from "react"
import { Route, createHashRouter, RouterProvider, createRoutesFromElements } from "react-router-dom"

const HomePage = lazy(() => import("../pages/home"))
const LoginPage = lazy(() => import("../pages/login"))
const NotFoundPage = lazy(() => import("../pages/404"))

const routerItems = [
  <Route path="/" element={<LoginPage />} />,
  <Route path="/home" element={<HomePage />} />,
  <Route path="/login" element={<LoginPage />} />,
  <Route path="*" element={<NotFoundPage />} />,
]

const router = createHashRouter(createRoutesFromElements(routerItems))

export const RouteContainer = () => {
  return <RouterProvider router={router} future={{ v7_startTransition: true }}></RouterProvider>
}
