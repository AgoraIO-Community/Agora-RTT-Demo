import { useCatchError, useScreenResize } from "@/common"
import { RouteContainer } from "./router"

function App() {
  useCatchError()
  useScreenResize()

  return <RouteContainer></RouteContainer>
}

export default App
