import {
  fetchFromEPS,
  createCloseEvent,
  exitApplication,
  formattedSortCode,
} from "./utils";
import { globalEventCreators } from "@barclays/mca-events";

// Mock the necessary modules and globals
jest.mock("@barclays/mca-events");
global.navigator = { userAgent: "", platform: "", maxTouchPoints: 0 } as any;
global.window = {} as any;

describe("Utility Functions", () => {
  describe("fetchFromEPS", () => {
    const mockApi = {
      service: { call: jest.fn() },
      loadManager: { loading: jest.fn() },
    };

    it("should return successful response", async () => {
      mockApi.service.call.mockResolvedValue({
        status: 200,
        data: { result: "success" },
      });
      const result = await fetchFromEPS("testUrl", mockApi, {
        testBody: "data",
      });
      expect(result).toEqual({
        getRes: { result: "success" },
        res: { result: "success" },
        isError: false,
      });
      expect(mockApi.loadManager.loading).toHaveBeenCalledWith(false);
    });

    it("should handle error response", async () => {
      mockApi.service.call.mockResolvedValue({
        status: 400,
        data: { error: "Bad Request" },
      });
      const result = await fetchFromEPS("testUrl", mockApi);
      expect(result).toEqual({
        getRes: { error: "Bad Request" },
        res: { error: "Bad Request" },
        isError: true,
      });
    });

    it("should handle exception", async () => {
      mockApi.service.call.mockRejectedValue(new Error("Network Error"));
      const result = await fetchFromEPS("testUrl", mockApi);
      expect(result).toEqual({
        getRes: new Error("Network Error"),
        res: new Error("Network Error"),
        isError: true,
      });
    });
  });

  describe("createCloseEvent", () => {
    it("should create and send close event", () => {
      const mockApi = {
        getCallbackUrls: jest
          .fn()
          .mockReturnValue({ closeUrl: "testCloseUrl" }),
        communication: { sendToHost: jest.fn() },
      };
      const mockCreateSuccessPageEvent = jest
        .fn()
        .mockReturnValue("mockCloseEvent");
      (globalEventCreators.successPage.createSuccessPageEvent as jest.Mock) =
        mockCreateSuccessPageEvent;

      createCloseEvent(mockApi);

      expect(mockCreateSuccessPageEvent).toHaveBeenCalledWith({
        url: "testCloseUrl",
      });
      expect(mockApi.communication.sendToHost).toHaveBeenCalledWith(
        "mockCloseEvent"
      );
    });
  });

  describe("exitApplication", () => {
    it("should handle iOS devices", () => {
      global.navigator.platform = "iPad";
      global.window.webkit = {
        messageHandlers: { BMBiOSHandler: { postMessage: jest.fn() } },
      };

      exitApplication();

      expect(
        global.window.webkit.messageHandlers.BMBiOSHandler.postMessage
      ).toHaveBeenCalledWith({ name: "back", shouldRefresh: false });
    });

    it("should handle Android devices", () => {
      global.navigator.userAgent = "Android";
      global.mca2JavaScriptInterface = { onEventFired: jest.fn() };

      exitApplication();

      expect(global.mca2JavaScriptInterface.onEventFired).toHaveBeenCalledWith(
        "exitMca2Journey",
        JSON.stringify({ shouldRefresh: false })
      );
    });
  });

  describe("formattedSortCode", () => {
    it("should format sort code correctly", () => {
      expect(formattedSortCode("123456", "-")).toBe("12-34-56");
      expect(formattedSortCode("123456", " ")).toBe("12 34 56");
      expect(formattedSortCode("12345678", "-")).toBe("12-34-56-78");
    });
  });
});
