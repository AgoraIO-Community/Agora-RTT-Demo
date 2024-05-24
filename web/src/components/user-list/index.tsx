import { useDispatch } from "react-redux"
import { setMemberListShow } from "@/store/reducers/global"
import { CloseOutlined } from "@ant-design/icons"
import UserItem from "./user-item"
import { IUserData } from "@/types"
import { useTranslation } from "react-i18next"

import styles from "./index.module.scss"

interface IUserListProps {
  data?: IUserData[]
  onClickItem?: (data: IUserData) => void
}

const UserList = (props: IUserListProps) => {
  const { data = [], onClickItem = () => {} } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const onClickClose = () => {
    dispatch(setMemberListShow(false))
  }

  return (
    <div className={styles.userList}>
      <div className={styles.title}>
        <span className={styles.text}>
          {t("footer.participantsList")} ({data.length + 1})
        </span>
        <CloseOutlined onClick={onClickClose} />
      </div>
      <div className={styles.content}>
        <div className={styles.list}>
          {data.map((item) => {
            return <UserItem data={item} key={item.userId} onClick={onClickItem}></UserItem>
          })}
        </div>
      </div>
    </div>
  )
}

export default UserList
