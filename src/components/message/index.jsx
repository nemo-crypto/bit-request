import React from 'react';
import ReactDOM from 'react-dom';
class Message extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: true };
  }

  componentDidMount() {
    const { duration = 3000, onClose } = this.props;
    this.timer = setTimeout(() => {
      this.setState({ visible: false }, onClose);
    }, duration);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }
  handleClose = () => {
    const { onClose } = this.props;
    this.setState({ visible: false }, onClose);
  };
  render() {
    const classNames = {
      position: 'fixed',
      top: ' 50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 999,
      minWidth: ' 260px',
      maxWidth: '500px',
      wordWrap: 'break-word',
      textAlign: 'center',
      padding: ' 14px 20px',
      fontSize: '14px',
      color: '#fff',
      backgroundColor: 'rgba(67, 86, 104, 0.8)',
      borderRadius: ' 4px',
    };
    const { message } = this.props;
    const { visible } = this.state;
    return (
      <div className={`${this.props.className}`}>
        {visible && (
          <div className="message-content" style={classNames}>
            {message}
          </div>
        )}
      </div>
    );
  }
}

const message = (message, duration = 3000, onClose) => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const handleClose = () => {
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  };
  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(
    <Message
      message={message}
      duration={duration}
      onClose={onClose || handleClose}
    />,
    div,
  );
};

export default message;
