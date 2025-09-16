
class ApiResponse {
  constructor(statusCode, data, message = "Success", errors = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }
}

export default ApiResponse;



