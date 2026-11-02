import React from 'react';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';
import actions from '../action/AutopayTerminateUploadAction';
import msgActions from '../action/MsgActions';

import { Container, Row, Col, Button, Navbar, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactTable from "react-table";
import "react-table/react-table.css";
import MainPopover from '../component/MainPopover';
import '../style/autopay.scss';
import { SysParm } from '../service/settings';
import AutopayTerminateUploadPopUp from './AutopayTerminateUploadPopUp';
import PageLoading from '../component/PageLoading';

class AutopayTerminateUploadMain extends React.Component {

    fileRef = React.createRef();

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
        const { AutopayTerminateUploadReducer } = this.props;
        let color = "white";
        if (rowInfo.index === AutopayTerminateUploadReducer.rowMouseOver) {
            color = '#ACD6FF';
        } else {
            if (rowInfo.original.editFlag == '') {
                color = '#02DF82';
            }
            color = rowInfo.index === AutopayTerminateUploadReducer.rowEdit ? "#00afec" : color;

        }
        return color;
    }

    browse = (event) => {
        this.fileRef.current.click();
    }

    render() {

        const { AutopayTerminateUploadReducer, actions, homeInfo } = this.props;
        let { loginName } = homeInfo;
        let { searchParam, uploadLogList, rowEdit, rowMouseOver, date, attachObj, showFlag, startBtn, isLoading, attachmentConfig, ready } = AutopayTerminateUploadReducer;
        let fileSelect = attachObj?.fileSelect;
        if (!fileSelect) {
            fileSelect = {};
        }

        let NullComponent = () => null;

        return (
            <React.Fragment>
                <MainPopover />
                <PageLoading isOpen={isLoading} />
                <AutopayTerminateUploadPopUp showFlag={showFlag} />
                <Navbar expand="sm" variant="hmms" sticky="top" >
                    <Navbar.Brand>Autopay Termination Disk Upload</Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Button variant="info" size="sm" onClick={this.returnMain} >Return</Button>
                    </Navbar.Collapse>
                </Navbar>

                <Container fluid className="ih-fs1">
                    <Row>&nbsp;</Row>
                    <Form style={{ fontWeight: "bold" }} >
                        <Form.Group as={Row} className="tipContent" style={{ height: '25px' }}>
                            <Form.Label column md={1} lg={1}>Upload Date:</Form.Label>
                            <Col md={2} lg={2}>
                                <Form.Control disabled value={date} />
                            </Col>
                            <Form.Label column md={1} lg={1}>Updated By:</Form.Label>
                            <Col md={2} lg={2}>
                                <Form.Control disabled value={loginName} as="input" />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="tipContent" style={{ height: '25px' }}>
                            <Form.Label column md={3} lg={3}>Step 1</Form.Label>
                            <Form.Label column md={3} lg={3}>Step 2</Form.Label>
                            <Form.Label column md={3} lg={3}>Step 3</Form.Label>
                        </Form.Group>
                        <Form.Group as={Row} className="tipContent" style={{ height: '25px' }}>
                            <Form.Label column md={3} lg={3}>Select Data File(s)</Form.Label>
                            <Form.Label column md={3} lg={3}>Upload File(s)</Form.Label>
                            <Form.Label column md={3} lg={3}>Start Process</Form.Label>
                        </Form.Group>
                        <Form.Group as={Row} className="tipContent" style={{ height: '25px' }}>
                            <Col md={3} lg={3}>
                                <Button size="sm" variant="light" style={{ border: '1px solid gray' }} disabled={isLoading || !ready} onClick={() => this.browse()}>Browse</Button>
                            </Col>
                            <Col md={3} lg={3}>
                                <Button size="sm" variant="light" style={{ border: '1px solid gray' }} disabled={isLoading || !ready || !uploadLogList.some(item => item.uploadFlag)} onClick={() => actions.uploadFile(this)}>Upload</Button>
                            </Col>
                            <Col md={3} lg={3}>
                                <Button size="sm" variant="light" style={{ border: '1px solid gray' }} disabled={isLoading || startBtn || !ready || uploadLogList.some(item => item.uploadFlag) || !uploadLogList.some(item => item.uploadStatus === "UPLOAD_SUCCESS")} onClick={() => actions.toggleStartProcess(this)}>Start</Button>
                            </Col>
                            <Col md={6} lg={6} style={{ display: "none" }} >
                                <input type="file" accept={String(attachmentConfig.uploadExtension || "").replace(/\*/g, "").replace(/;/g, ",")} ref={this.fileRef} onChange={(e) => { actions.appendFile(this, e.target.files[0]); e.target.value = ""; }}></input>
                                <input value={fileSelect.name} size="60" disabled="true"></input>
                            </Col>
                        </Form.Group>
                    </Form>

                    <Row>&nbsp;</Row>
                    <ReactTable
                        data={uploadLogList}
                        NoDataComponent={NullComponent}
                        sortable={false}
                        showPagination={false}
                        pagination={false}
                        showPageJump={false}
                        resizable={false}
                        className="-striped -highlight"
                        pageSize={uploadLogList?.length > SysParm.RT_M_defaultPageSize ? uploadLogList?.length : SysParm.RT_M_defaultPageSize}
                        minRows={SysParm.RT_M_defaultPageSize}
                        style={{ height: '460px' }}
                        columns={[
                            {
                                Header: "Step 1",
                                headerStyle: { _hover: { "background": "red" } },
                                columns: [
                                    {
                                        Header: "Delete",
                                        accessor: "type",
                                        minWidth: 10,
                                        style: { "textAlign": "center" },
                                        sortable: false,
                                        Cell: ({ original, index }) => {
                                            return (
                                                <Button size="sm" variant='link' onClick={() => actions.deleteFile(this, index)}>
                                                    Delete
                                                </Button>
                                            );
                                        }
                                    },
                                    {
                                        Header: "File Selected",
                                        accessor: "fileName",
                                        minWidth: 30,
                                        style: { "textAlign": "left" },
                                        sortable: false,
                                        // Cell: ({ original }) => {
                                        //     return (
                                        //         <>{original.uploadFlag ? original.fileName.toUpperCase() : original.fileName}</>
                                        //     );
                                        // }
                                    }
                                ]
                            },
                            {
                                Header: "Step 2",
                                columns: [
                                    {
                                        Header: "Upload Status",
                                        accessor: "uploadStatus",
                                        minWidth: 30,
                                        style: { "textAlign": "left" },
                                        sortable: false,
                                    }
                                ]
                            },
                            {
                                Header: "Step 3",
                                columns: [
                                    {
                                        Header: "Total",
                                        accessor: "total",
                                        minWidth: 10,
                                        headerStyle: { "textAlign": "right" },
                                        style: { "textAlign": "right" },
                                        sortable: false,
                                    },
                                    {
                                        Header: "Success",
                                        accessor: "success",
                                        minWidth: 10,
                                        headerStyle: { "textAlign": "right" },
                                        style: { "textAlign": "right" },
                                        sortable: false,
                                    },
                                    {
                                        Header: "Fail",
                                        accessor: "fail",
                                        minWidth: 10,
                                        headerStyle: { "textAlign": "right" },
                                        style: { "textAlign": "right" },
                                        sortable: false,
                                    },
                                    {
                                        Header: "Message",
                                        accessor: "processMess",
                                        minWidth: 60,
                                        headerStyle: { "textAlign": "left" },
                                        style: { "textAlign": "left" },
                                        sortable: false,
                                        Cell: ({ original }) => {
                                            return (
                                                original.processMess ?
                                                    <Button size="sm" variant='link' onClick={() => actions.toggleUploadDetailMessage(this, original.id)}>{original.processMess}</Button>
                                                    : <></>
                                            );
                                        }
                                    }
                                ]
                            },
                        ]}
                        getTrProps={(props, rowInfo) => {
                            if (rowInfo && rowInfo.row) {
                                return {
                                    onClick: e => {
                                        if (rowInfo.index != rowEdit) {
                                            rowEdit = rowInfo.index;
                                            actions.changeValue("rowEdit", rowEdit);
                                            actions.changeValue("rowMouseOver", -1);
                                        }
                                        actions.changeValue("rowSelected", rowInfo.original);
                                    },
                                    onMouseLeave: e => {
                                        actions.changeValue("rowMouseOver", -1);
                                    },
                                    onMouseOver: e => {
                                        if (rowInfo.index != rowMouseOver) {
                                            rowMouseOver = rowInfo.index;
                                            actions.changeValue("rowMouseOver", rowMouseOver);
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
                </Container>


            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => ({
    AutopayTerminateUploadReducer: state.AutopayTerminateUploadReducer,
    homeInfo: state.homeInfo,
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch),
    msgActions: bindActionCreators(msgActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(AutopayTerminateUploadMain);
