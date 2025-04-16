import { Modal } from "antd"

interface IDevSettingProps {
  showSecretModal: boolean
  onOk?: () => void
  onCancel?: () => void
}
export const DevSetting = (props: IDevSettingProps) => {
  const { showSecretModal } = props
  return (
    <Modal
      title="Secret Modal"
      open={showSecretModal}
      maskClosable={false}
      onOk={props.onOk}
      onCancel={props.onCancel}
    >
      <p>This is a secret modal!</p>
    </Modal>
  )
}
