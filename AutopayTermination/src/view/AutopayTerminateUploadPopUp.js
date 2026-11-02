import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from '../action/AutopayTerminateUploadAction';
import msgActions from '../action/MsgActions';
import '../style/App.scss';
import MainPopover from '../component/MainPopover';
import { Container, Row, Col, Button, Navbar, Form, Modal, ModalBody } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactTable from "react-table";
import "react-table/react-table.css";
import { SysParm } from '../service/settings';
import AutopayTerminateUploadReducer from '../reducer/AutopayTerminateUploadReducer';

class AutopayTerminateUploadPopUp extends React.Component {
    
    returnMain = (event) => {
        if (event) {
            event.preventDefault();
        }

        if (this.props.history) {
            this.props.history.push({ pathname: "/" });
        }
    }

    componentDidMount() {
        let { actions } = this.props;
        console.log("call componentDidMount");

    }

    getRowBackgroundColor = (rowInfo) => {
        const {AutopayTerminateUploadReducer } = this.props;
        let color = "white";
        if (rowInfo.index ===AutopayTerminateUploadReducer.detailRowMouseOver) {
            color = '#ACD6FF';
        } else {
            if (rowInfo.original.editFlag == '') {
                color = '#02DF82';
            }
            color = rowInfo.index ===AutopayTerminateUploadReducer.detailRowEdit ? "#00afec" : color;

        }
        return color;
    }

    render() {
        
        const {AutopayTerminateUploadReducer, actions, showFlag, } = this.props;
        let {  detailRowEdit, detailRowMouseOver, uploadDetailList  } = AutopayTerminateUploadReducer;
        let NullComponent = () => null;
        if (!showFlag) {
            return null;
        }
        return (
            <Modal show={showFlag}  backdrop={true} size='lg' centered>
                
               <Modal.Body>
                    <React.Fragment>
                        <Navbar expand="xl" variant="hmms" sticky="top" >
                            <Navbar.Brand>Error Message</Navbar.Brand>
                            {/* <Navbar.Collapse className="justify-content-end">
                                <Button variant="info" size="sm" onClick={this.returnMain} >Close</Button>
                            </Navbar.Collapse> */}
                        </Navbar>
                        <Container fluid className="tipContent">
                            <Row>&nbsp;</Row>
                            <Row>&nbsp;&nbsp;&nbsp;&nbsp;Error in upload file, the detailed information is:</Row>
                            
                            <ReactTable
                                data={uploadDetailList}
                                NoDataComponent={NullComponent}
                                sortable={false}
                                showPagination={false}
                                pagination={false}
                                showPageJump={false}
                                resizable={false}
                                className="-striped -highlight"
                                pageSize={uploadDetailList.length > SysParm.RT_M_defaultPageSize ? uploadDetailList.length : SysParm.RT_M_defaultPageSize}
                                minRows={SysParm.RT_M_defaultPageSize}
                                style={{ height: '460px' }}
                                columns={[
                                    {
                                        Header: 'Line No',
                                        headerClassName: "tableHeader",
                                        headerStyle : { "background": "blue", "color": "white" },
                                        accessor: 'weekDay',
                                        minWidth: 20,
                                        style: { "textAlign": "center" },
                                        sortable: true,
                                        Cell: ({ original }) => {
                                            return (
                                                <div>{original.lineNo?.split(' ')[1]}</div>
                                            );
                                        },
                                    },
                                    {
                                        Header: 'Message',
                                        headerClassName: "tableHeader",
                                        headerStyle : {"background": "blue", "color": "white"},
                                        accessor: 'code',
                                        minWidth: 90,
                                        sortable: true,
                                    },
                                ]}
                                getTrProps={(props, rowInfo) => {
                                    if (rowInfo && rowInfo.row) {
                                        return {
                                            onClick: e => {
                                                if (rowInfo.index != detailRowEdit) {
                                                    detailRowEdit = rowInfo.index;
                                                    actions.changeValue("detailRowEdit", detailRowEdit);
                                                    actions.changeValue("detailRowMouseOver", -1);
                                                }
                                                actions.changeValue("rowSelected", rowInfo.original);
                                            },
                                            onMouseLeave: e => {
                                                actions.changeValue("detailRowMouseOver", -1);
                                            },
                                            onMouseOver: e => {
                                                if (rowInfo.index != detailRowMouseOver) {
                                                    detailRowMouseOver = rowInfo.index;
                                                    actions.changeValue("detailRowMouseOver", detailRowMouseOver);
                                                }
                                            },
                                            style: {
                                                background: this.getRowBackgroundColor(rowInfo)
                                            }
                                        };
                                    } else {
                                        return {};
                                    }
                                }}
                            />
                            <Row>&nbsp;</Row>
                            <div style={{display: 'flex', justifyContent: 'right'}}>
                                <Button size="sm" variant="light" style={{ border: '1px solid gray' }} onClick={() => actions.returnMain(this)}>Close</Button>
                            </div>
                        </Container>


                    </React.Fragment>
                </Modal.Body>
            </Modal>
        );
    }
}

const mapStateToProps = (state) => ({
    AutopayTerminateUploadReducer: state.AutopayTerminateUploadReducer,
    msgData: state.msgData
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch),
    msgActions: bindActionCreators(msgActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(AutopayTerminateUploadPopUp);
