package com.mega.haksamate.repository;

import com.mega.haksamate.entity.Report;
import com.mega.haksamate.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
    long countByReported(Profile reported);

    void deleteAllByItem_Itemid(Long itemId);
}
