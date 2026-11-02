# AutoPay Termination前端

React前端，打包为autopay.war，独立调用Autopay_Term_WS及现有iHousing公共服务。

- 手工录入：H5_autopay_terminateInput。
- 文件上传：H5_autopay_terminateUpload。

URL配置在src/service/service.js；构建机使用Node14.16.0/npm6.14.11。
详见 [BUILD_WAR.md](BUILD_WAR.md)。本轮前端调整不代表后端JDK21升级或业务验收已完成。
