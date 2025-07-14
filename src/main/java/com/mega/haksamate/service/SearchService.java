package com.mega.haksamate.service;

import com.mega.haksamate.entity.History;
import com.mega.haksamate.entity.Profile;

import com.mega.haksamate.repository.ProfileRepository;
import com.mega.haksamate.repository.SearchHistoryRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {
    private final SearchHistoryRepository searchHistoryRepository;
    private final ProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public List<String> getSuggestions(UUID userId, String keyword) {
        Profile user = profileRepository.findById(userId).orElseThrow();
        return searchHistoryRepository
                .findTop5ByProfileAndKeywordContainingOrderBySearchAtDesc(user, keyword)
                .stream()
                .map(History::getKeyword)
                .distinct()
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getSearchHistory(UUID userId) {
        Profile user = profileRepository.findById(userId).orElseThrow();
        return searchHistoryRepository.findAllByProfileOrderBySearchAtDesc(user)
                .stream()
                .map(History::getKeyword)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addSearchHistory(UUID userId, String keyword) {
        Profile user = profileRepository.findById(userId).orElseThrow();
        searchHistoryRepository.deleteByProfileAndKeyword(user, keyword);
        History history = History.builder()
                .profile(user)
                .keyword(keyword)
                .searchAt(LocalDateTime.now())
                .build();
        searchHistoryRepository.save(history);
    }

    @Transactional
    public void deleteSearchHistory(UUID userId, String keyword) {
        Profile user = profileRepository.findById(userId).orElseThrow();
        searchHistoryRepository.deleteByProfileAndKeyword(user, keyword);
    }

    @Transactional
    public void deleteAllSearchHistory(UUID userId) {
        Profile user = profileRepository.findById(userId).orElseThrow();
        searchHistoryRepository.deleteAllByProfile(user);
    }
}
