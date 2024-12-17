import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PreviewDQ = {
  address: string;
  updatedAt: string;
  value: string;
};

// state type
export type PreviewDQState = {
  previewDQs: PreviewDQ[];
};

// init state
const initialState: PreviewDQState = {
  previewDQs: [],
};

// slice create
export const previewDQSlice = createSlice({
  name: 'previewDailyQuotal',
  initialState,
  reducers: {
    updatePreviewDQ: (
      state: PreviewDQState,
      action: PayloadAction<PreviewDQ[]>
    ) => {
      state.previewDQs = action.payload;
    },
  },
});

// normal flow action
export const previewDQSliceActions = { ...previewDQSlice.actions };

// export
export default previewDQSlice.reducer;
