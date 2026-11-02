// HTML5-Base common 2022.07.05
// Accumulated system message in a window.
import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import msgActions from '../action/MsgActions'
import { Button, Modal } from 'react-bootstrap';
import '../style/App.scss';
import icoInfo from '../img/info.ico';
import icoWarning from '../img/warning.ico';
import icoError from '../img/error.ico';

const MainPopover = (props) => {
  const [show, setShow] = useState(false);

  const { msgData: { msgShow, msgList }, msgActions } = props;

  const handleClose = () => {
    msgActions.clearMsg();
  };

  const handleHide = () => {
    msgActions.hideMsg();
  };

  return (
    <>
      <Modal show={msgShow} onHide={handleHide} backdrop={true} scrollable className="mainPop" >
        <Modal.Header>
          <Button className="close" onClick={handleClose} style={{padding:"0.5rem 0.5rem"}}><span aria-hidden="true">×</span></Button>
        </Modal.Header>
        <Modal.Body style={{ height: "20rem" }}>
          {
            msgList.map((msgData) => {
              let icoUrl = null;
              switch (msgData.type) {
                case 'info':
                  icoUrl = icoInfo;
                  break;
                case 'warning':
                  icoUrl = icoWarning;
                  break;
                case 'error':
                  icoUrl = icoError;
                  break;
                default:
                  icoUrl = icoInfo;
              }

              return <div><img className="logo" src={icoUrl} />{msgData.msg}</div>
            }
            )
          }
        </Modal.Body>
        <Modal.Footer style={{ justifyContent: "flex-start" }} >
          <Button variant="secondary" onClick={handleHide}>
            Hide
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

const mapStateToProps = (state) => ({
  msgData: state.msgData
})

const mapDispatchToProps = dispatch => ({
  msgActions: bindActionCreators(msgActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(MainPopover);