package com.mega.haksamate.controller;

import com.mega.haksamate.dto.SearchKeywordRequestDTO;
import com.mega.haksamate.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/search-history")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;


    @PostMapping
    public ResponseEntity<Void> saveKeyword(@RequestBody SearchKeywordRequestDTO req) {
        if (req.getKeyword() == null || req.getUserId() == null || req.getKeyword().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        searchService.addSearchHistory(req.getUserId(), req.getKeyword().trim());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/suggest")
    public ResponseEntity<List<String>> getSuggestions(@RequestParam UUID userId, @RequestParam String keyword) {
        return ResponseEntity.ok(searchService.getSuggestions(userId, keyword));
    }

    @GetMapping
    public ResponseEntity<List<String>> getSearchHistory(@RequestParam UUID userId) {
        return ResponseEntity.ok(searchService.getSearchHistory(userId));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAll(@RequestParam UUID userId) {
        searchService.deleteAllSearchHistory(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{keyword}")
    public ResponseEntity<Void> deleteOne(@RequestParam UUID userId, @PathVariable String keyword) {
        searchService.deleteSearchHistory(userId, keyword);
        return ResponseEntity.ok().build();
    }
}
