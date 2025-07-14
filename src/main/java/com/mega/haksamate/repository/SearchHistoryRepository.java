package com.mega.haksamate.repository;

import com.mega.haksamate.entity.History;
import com.mega.haksamate.entity.Profile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SearchHistoryRepository extends JpaRepository<History, Long> {

    List<History> findTop5ByProfileAndKeywordContainingOrderBySearchAtDesc(Profile user, String keyword);

    List<History> findAllByProfileOrderBySearchAtDesc(Profile user);

    void deleteByProfileAndKeyword(Profile user, String keyword);

    void deleteAllByProfile(Profile user);
}
