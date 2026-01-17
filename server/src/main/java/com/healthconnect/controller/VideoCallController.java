package com.healthconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * HealthConnect - Video Call Appointment Controller
 * Manages video call room creation and appointment scheduling
 */
@RestController
@RequestMapping("/api/video-calls")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class VideoCallController {

    /**
     * Generate a unique room ID for a video call
     */
    @PostMapping("/generate-room")
    public ResponseEntity<Map<String, Object>> generateRoom(@RequestBody Map<String, Object> request) {
        try {
            String doctorId = (String) request.get("doctorId");
            String patientId = (String) request.get("patientId");
            String appointmentId = (String) request.get("appointmentId");
            
            // Generate unique room ID
            String roomId = appointmentId != null ? appointmentId : "ROOM-" + UUID.randomUUID().toString();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("roomId", roomId);
            response.put("doctorId", doctorId);
            response.put("patientId", patientId);
            response.put("signalingServer", "http://localhost:4000");
            response.put("createdAt", LocalDateTime.now().toString());
            response.put("message", "Video call room created successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to create video call room: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Create a scheduled video call appointment
     */
    @PostMapping("/schedule")
    public ResponseEntity<Map<String, Object>> scheduleVideoCall(@RequestBody Map<String, Object> request) {
        try {
            String doctorId = (String) request.get("doctorId");
            String patientId = (String) request.get("patientId");
            String doctorName = (String) request.get("doctorName");
            String patientName = (String) request.get("patientName");
            String scheduledTime = (String) request.get("scheduledTime");
            
            // Generate appointment and room ID
            String appointmentId = "APPT-" + UUID.randomUUID().toString();
            String roomId = "ROOM-" + appointmentId;
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("appointmentId", appointmentId);
            response.put("roomId", roomId);
            response.put("doctorId", doctorId);
            response.put("patientId", patientId);
            response.put("doctorName", doctorName);
            response.put("patientName", patientName);
            response.put("scheduledTime", scheduledTime);
            response.put("status", "SCHEDULED");
            response.put("signalingServer", "http://localhost:4000");
            response.put("createdAt", LocalDateTime.now().toString());
            response.put("message", "Video call appointment scheduled successfully");
            
            // In production, save this to database
            // appointmentRepository.save(appointment);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to schedule video call: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Start an instant video call
     */
    @PostMapping("/start-instant-call")
    public ResponseEntity<Map<String, Object>> startInstantCall(@RequestBody Map<String, Object> request) {
        try {
            String initiatorId = (String) request.get("initiatorId");
            String initiatorType = (String) request.get("initiatorType"); // "doctor" or "patient"
            String initiatorName = (String) request.get("initiatorName");
            String recipientId = (String) request.get("recipientId");
            String recipientName = (String) request.get("recipientName");
            
            // Generate instant call room ID
            String roomId = "INSTANT-" + UUID.randomUUID().toString();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("roomId", roomId);
            response.put("initiatorId", initiatorId);
            response.put("initiatorType", initiatorType);
            response.put("initiatorName", initiatorName);
            response.put("recipientId", recipientId);
            response.put("recipientName", recipientName);
            response.put("callType", "INSTANT");
            response.put("signalingServer", "http://localhost:4000");
            response.put("startedAt", LocalDateTime.now().toString());
            response.put("message", "Instant video call initiated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to start instant call: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Get video call room information
     */
    @GetMapping("/room/{roomId}")
    public ResponseEntity<Map<String, Object>> getRoomInfo(@PathVariable String roomId) {
        try {
            // In production, fetch from database
            // Room room = roomRepository.findByRoomId(roomId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("roomId", roomId);
            response.put("status", "ACTIVE");
            response.put("signalingServer", "http://localhost:4000");
            response.put("message", "Room information retrieved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Room not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * End a video call and record call duration
     */
    @PostMapping("/end-call")
    public ResponseEntity<Map<String, Object>> endCall(@RequestBody Map<String, Object> request) {
        try {
            String roomId = (String) request.get("roomId");
            String userId = (String) request.get("userId");
            Integer duration = (Integer) request.get("duration"); // in seconds
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("roomId", roomId);
            response.put("userId", userId);
            response.put("duration", duration);
            response.put("endedAt", LocalDateTime.now().toString());
            response.put("message", "Video call ended successfully");
            
            // In production, save call history to database
            // callHistoryRepository.save(callHistory);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to end call: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Video Call Service");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}
