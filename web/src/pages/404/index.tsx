import { Button, Result } from "antd"
import styles from "./index.module.scss"
import { useNavigate } from "react-router-dom"

const NotFoundPage = () => {
  const nav = useNavigate()

  const navBackHome = () => {
    nav("/home")
  }

  return (
    <div className={styles.notFoundPage}>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" onClick={navBackHome}>
            Back Home
          </Button>
        }
      />
    </div>
  )
}

export default NotFoundPage
