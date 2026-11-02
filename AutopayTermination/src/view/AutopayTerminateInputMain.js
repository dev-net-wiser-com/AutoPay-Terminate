import React from 'react';
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import { bindActionCreators } from 'redux';
import actions from '../action/AutopayTerminateInputAction';
import msgActions from '../action/MsgActions';
import { Container, Row, Col, Button, Navbar, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactTable from "react-table";
import "react-table/react-table.css";
import MainPopover from '../component/MainPopover';
import '../style/autopay.scss';
import { SysParm } from '../service/settings';
import { parseDate } from '../service/autopayApi';

class AutopayTerminateInputMain extends React.Component {

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
        actions.init();

    }

    getRowBackgroundColor = (rowInfo) => {
        const { AutopayTerminateInputReducer } = this.props;
        let color = "white";
        if (rowInfo.index === AutopayTerminateInputReducer.rowMouseOver) {
            color = '#ACD6FF';
        } else {
            if (rowInfo.original.editFlag == '') {
                color = '#02DF82';
            }
            color = rowInfo.index === AutopayTerminateInputReducer.rowEdit ? "#00afec" : color;

        }
        return color;
    }

    stringToDate = (date) => {
        if (!date) return null;
        let dateValue = date;
        dateValue = dateValue.split('/');
        dateValue = new Date(dateValue[2], dateValue[1] - 1, dateValue[0]);
        return dateValue;
    }

    render() {

        const { AutopayTerminateInputReducer, actions, sysMsg, fncMsg } = this.props;
        let { terminationList, rowEdit, rowMouseOver, valueDate, isLoading, pendingLookups } = AutopayTerminateInputReducer;
        let NullComponent = () => null;

        return (
            <React.Fragment>
                <MainPopover />
                <Navbar expand="sm" variant="hmms" sticky="top" >
                    <Navbar.Brand>{fncMsg["aptInputModule.title"]}</Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Button variant="info" size="sm" disabled={isLoading || pendingLookups > 0} onClick={() => actions.addRows(this)}>Add Rows</Button>&nbsp;
                        <Button variant="info" size="sm" disabled={isLoading} onClick={() => actions.delRows(this)}>Del Rows</Button>&nbsp;
                        <Button variant="info" size="sm" disabled={isLoading || pendingLookups > 0} onClick={() => actions.save(this)}>Save</Button>&nbsp;
                        <Button variant="info" size="sm" onClick={this.returnMain}>Cancel</Button>
                    </Navbar.Collapse>
                </Navbar>

                <Container fluid className="ih-fs1">
                    <Row>&nbsp;</Row>
                    <Form style={{ fontWeight: "bold", height: '25px' }} >
                        <Form.Group as={Row} className="tipContent">
                            <Form.Label column style={{ textAlign: 'right' }}>Termination Date must be on or after: {valueDate}</Form.Label>
                        </Form.Group>
                    </Form>
                    <Row>&nbsp;</Row>
                    <ReactTable
                        data={terminationList}
                        NoDataComponent={NullComponent}
                        sortable={false}
                        showPagination={false}
                        pagination={false}
                        showPageJump={false}
                        resizable={false}
                        className="-striped -highlight"
                        pageSize={terminationList?.length > SysParm.RT_L_defaultPageSize ? terminationList?.length : SysParm.RT_L_defaultPageSize}
                        style={{ height: '675px' }}
                        columns={[
                            {
                                Header: "Del",
                                accessor: "type",
                                minWidth: 30,
                                style: { "textAlign": "center" },
                                sortable: false,
                                Cell: ({ original, index }) => {
                                    return (
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            disabled={isLoading} checked={!!original.checked}
                                            onChange={() => actions.changeCheck(this, index)}
                                        />
                                    );
                                }
                            },
                            {
                                Header: 'Property Reference',
                                minWidth: 100,
                                headerStyle: { "textAlign": "left" },
                                sortable: false,
                                Cell: ({ original, index }) => {
                                    return (
                                        <Form.Control
                                            style={{ height: '20px' }}
                                            disabled={isLoading} value={original.propertyRef || ""}
                                            onChange={(e) => {
                                                actions.changeListValue("terminationList", index, "propertyRef", e.target.value)
                                            }}
                                            onBlur={(e) => {
                                                actions.changeListValue("terminationList", index, "propertyRef", e.target.value.toUpperCase())
                                                actions.lookupTenancyNameLang(this, index);
                                            }}
                                        />
                                    );
                                }
                            },
                            {
                                Header: 'Payment Reference',
                                minWidth: 100,
                                headerStyle: { "textAlign": "left" },
                                sortable: false,
                                Cell: ({ original, index }) => {
                                    return (
                                        <Form.Control
                                            style={{ height: '20px' }}
                                            disabled={isLoading} value={original.paymentRef || ""}
                                            onChange={(e) => {
                                                actions.changeListValue("terminationList", index, "paymentRef", e.target.value)
                                            }}
                                            onBlur={(e) => {
                                                actions.lookupTenancyNameLang(this, index)
                                            }}
                                        />
                                    );
                                }
                            },
                            {
                                Header: 'Termination Date',
                                accessor: 'action',
                                headerStyle: { "textAlign": "right" },
                                minWidth: 100,
                                style: { "textAlign": "right" },
                                sortable: false,
                                Cell: ({ original, index }) => {
                                    return (
                                        <DatePicker
                                            disabled={isLoading} dateFormat="dd/MM/yyyy"
                                            selected={this.stringToDate(terminationList[index].terminationDate)}
                                            onChange={(date) => actions.datesFocusOutHandler(this, "terminationList", index, "terminationDate", date)}
                                            minDate={parseDate(valueDate) || undefined}
                                            maxDate={new Date('2999', '11', '31')}
                                            placeholderText="Select a Date"
                                            wrapperClassName="datePicker"
                                            onFocus={(e) => {
                                                e.target.select();
                                            }}
                                        />
                                    );
                                }
                            },
                            {
                                Header: "Tenancy Name",
                                accessor: "tenancyName",
                                headerStyle: { "textAlign": "left" },
                                minWidth: 100,
                                style: { "textAlign": "center" },
                                sortable: false,
                            },
                            {
                                Header: 'Payer Name',
                                accessor: 'payerName',
                                headerStyle: { "textAlign": "left" },
                                minWidth: 100,
                                sortable: false,
                            },
                            {
                                Header: "Payer A/C",
                                accessor: "payerAccount",
                                headerStyle: { "textAlign": "left" },
                                minWidth: 150,
                                style: { "textAlign": "center" },
                                sortable: false,
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

                </Container>


            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => ({
    AutopayTerminateInputReducer: state.AutopayTerminateInputReducer,
    fncMsg: state.homeInfo.fncMsg,
    sysMsg: state.homeInfo.sysMsg,
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch),
    msgActions: bindActionCreators(msgActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(AutopayTerminateInputMain);
