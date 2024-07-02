interface ApiResponse<T = any> {
    statusCode: number;
    data: T | null;
    message: string;
    error?: string | Error; // Optional error message or Error object
    success: boolean;
}
class ApiResponse<T = any> {
    public statusCode: number;
    public data: T | null;
    public message: string;
    public error?: string | Error;

    constructor(statusCode: number, data: T | null = null, message = "Success", error?: string | Error) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.error = error;
        this.success = statusCode < 400 && !error;
    }
}

export { ApiResponse };

