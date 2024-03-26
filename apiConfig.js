export const apiConfig = {
    sender: { mail: 'marc@realmotor.jp', alias: 'BAN' },
    tokenkey: '0iXRkSCDfNwO', // Adjust based on environment
    realmotor_url: 'http://control.realmotor.jp/vehicle_update/',
    show_json_api: 1, // 1: show json, 0: do not show
    api_delay: 50, // This might not be applicable directly in React
    sales_job_import_flag: 1, // Additional flag
    ftp_info: { // FTP information (use with caution)
        domain_url: 'control-dev.realmotor.jp',
        folder: '/',
        user_login: 'rmj-jackall-dev',
        password: 'od7hIcWkz3',
        upload_dir: '/vehicle_state'
    },
};






