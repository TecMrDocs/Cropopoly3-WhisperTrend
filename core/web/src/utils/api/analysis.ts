import { get, post } from "../methods";

export interface AnalysisRequest {
  model: string;
  analysis_data: any;
}

export interface AnalysisResponse {
  analysis: string;
  saved: boolean;
}

const analysisApi = {
  analysis: {
    testPromptContext: (data: any): Promise<any> =>
      post("analysis/test-prompt-context", data, false),

    generateNew: (data: AnalysisRequest): Promise<AnalysisResponse> =>
      post("analysis", data, true),

    getLatest: (): Promise<string> =>
      get("analysis/latest", true),

    getPrevious: (): Promise<string> =>
      get("analysis/previous", true),

    getDummy: (): Promise<string> =>
      get("analysis/dummy", true),
  },
};

export default analysisApi;