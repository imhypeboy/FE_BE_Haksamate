package com.mega.haksamate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.net.Proxy;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetLocationDTO {
    private String address;
    private Double lat;
    private Double lng;

}