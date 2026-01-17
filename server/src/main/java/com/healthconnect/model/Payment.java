package com.healthconnect.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "payments")
public class Payment {
    @Id
    private String id;
    private String patientId;
    private String paymentType; // "CONSULTATION", "MEDICINE"
    private String orderId; // Razorpay order ID
    private String paymentId; // Razorpay payment ID
    private String paymentMethod; // "UPI", "CARD", "NETBANKING", "WALLET"
    private String paymentStatus; // "PENDING", "SUCCESS", "FAILED"
    private Double amount;
    private String currency;
    private String description;
    private String doctorId; // for consultation payments
    private String medicineOrderId; // for medicine payments
    private List<PaymentItem> items;
    private PaymentDetails paymentDetails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String invoiceNumber;
    private String invoiceUrl;

    // Constructors
    public Payment() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.currency = "INR";
        this.paymentStatus = "PENDING";
    }

    public Payment(String patientId, String paymentType, Double amount, String description) {
        this();
        this.patientId = patientId;
        this.paymentType = paymentType;
        this.amount = amount;
        this.description = description;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { 
        this.paymentStatus = paymentStatus;
        this.updatedAt = LocalDateTime.now();
    }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getMedicineOrderId() { return medicineOrderId; }
    public void setMedicineOrderId(String medicineOrderId) { this.medicineOrderId = medicineOrderId; }

    public List<PaymentItem> getItems() { return items; }
    public void setItems(List<PaymentItem> items) { this.items = items; }

    public PaymentDetails getPaymentDetails() { return paymentDetails; }
    public void setPaymentDetails(PaymentDetails paymentDetails) { this.paymentDetails = paymentDetails; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public String getInvoiceUrl() { return invoiceUrl; }
    public void setInvoiceUrl(String invoiceUrl) { this.invoiceUrl = invoiceUrl; }

    // Alias methods for backward compatibility
    public String getStatus() { return paymentStatus; }
    public void setStatus(String status) { setPaymentStatus(status); }
    
    public String getRazorpayOrderId() { return orderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.orderId = razorpayOrderId; }

    // Inner classes
    public static class PaymentItem {
        private String name;
        private String description;
        private Double price;
        private Integer quantity;
        private Double total;

        public PaymentItem() {}

        public PaymentItem(String name, String description, Double price, Integer quantity) {
            this.name = name;
            this.description = description;
            this.price = price;
            this.quantity = quantity;
            this.total = price * quantity;
        }

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public Double getTotal() { return total; }
        public void setTotal(Double total) { this.total = total; }
    }

    public static class PaymentDetails {
        private String bankName;
        private String cardType;
        private String cardLast4;
        private String upiId;
        private String walletName;
        private String transactionId;

        public PaymentDetails() {}

        // Getters and Setters
        public String getBankName() { return bankName; }
        public void setBankName(String bankName) { this.bankName = bankName; }

        public String getCardType() { return cardType; }
        public void setCardType(String cardType) { this.cardType = cardType; }

        public String getCardLast4() { return cardLast4; }
        public void setCardLast4(String cardLast4) { this.cardLast4 = cardLast4; }

        public String getUpiId() { return upiId; }
        public void setUpiId(String upiId) { this.upiId = upiId; }

        public String getWalletName() { return walletName; }
        public void setWalletName(String walletName) { this.walletName = walletName; }

        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    }
}