

type ToastProps = {
    message: string;
    type : "alert-info" | "alert-success" | "alert-error" | "alert-warning";
}


const Toast = (props: ToastProps) => (
<div className="toast z-50">
  <div className={`alert ${props.type} animate-fade-in`}>
    <span>{props.message}</span>
  </div>
</div>
)

export default Toast;