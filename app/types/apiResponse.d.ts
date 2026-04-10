interface ApiResponseDB<T = null> {
  success: boolean;
  message: string;
  data?: T;
}
