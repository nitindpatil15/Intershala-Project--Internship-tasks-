import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    value: null,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
    updateUserPhoto: (state, action) => {
        if (state.user) {
          state.user.photo = action.payload;
        }
      },
  },
});
export const { login, logout,updateUserPhoto } = userSlice.actions;
export const selectUser = (state) => state.user.user;
export default userSlice.reducer;
