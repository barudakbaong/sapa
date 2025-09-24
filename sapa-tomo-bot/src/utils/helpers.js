export function formatPhoneNumber(phone) {
    // Remove non-numeric characters and @s.whatsapp.net
    return phone.replace(/[^\d]/g, '').replace(/^0/, '62');
}

export function generateRequestId(service) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `${service}-${timestamp}-${random}`.toUpperCase();
}

export function validatePhoneNumber(phone) {
    const indonesianPhoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return indonesianPhoneRegex.test(phone);
}
