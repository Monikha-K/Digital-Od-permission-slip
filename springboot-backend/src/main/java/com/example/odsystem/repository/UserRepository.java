package com.example.odsystem.repository;

import com.example.odsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(User.Role role);

    List<User> findByDepartment(String department);

    List<User> findByRoleAndDepartment(User.Role role, String department);

    List<User> findByDepartmentAndIsClassAdvisorTrueAndAdvisorYear(String department, Integer advisorYear);
}
