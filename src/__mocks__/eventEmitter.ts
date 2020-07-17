import { EventEmitter } from "events";
import * as req from "./requestData";
export const addMockServerTransport = (emitter: EventEmitter, reqUri: string, resUri: string) => {
  emitter.on(reqUri, (data) => {
    const res = req.generateMockResponseData(resUri, data);
    if (res) {
      emitter.emit(resUri, res);
    }
  });
};
