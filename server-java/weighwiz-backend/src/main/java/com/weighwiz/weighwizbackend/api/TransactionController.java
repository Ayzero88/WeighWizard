package com.weighwiz.weighwizbackend.api;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;

import com.weighwiz.weighwizbackend.db.DeletedTransaction;
import com.weighwiz.weighwizbackend.db.DeletedTransactionRepository;
import com.weighwiz.weighwizbackend.db.Transaction;
import com.weighwiz.weighwizbackend.db.TransactionRepository;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionRepository repo;
    private final DeletedTransactionRepository deletedRepo;
    
    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);
    // only accept the two known scale ids; anything else is stored as null
    private String cleanScale(String s) {
        return ("GATE_1".equals(s) || "GATE_2".equals(s)) ? s : null;
    }

    public TransactionController(TransactionRepository repo,
                             DeletedTransactionRepository deletedRepo) {
        this.repo = repo;
        this.deletedRepo = deletedRepo;
    }
    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // ✅ Get all transactions
    @GetMapping("/all")
    public List<Transaction> getAllTransactions() {
        return repo.findAll(); // Spring Data JPA provides findAll()
    }

    // 1️⃣ Get unfinished transactions
    @GetMapping("/unfinished")
    public List<Transaction> getUnfinishedTransactions() {
        return repo.findUnfinishedTransactions();
    }

    // ✅ Get total number of transactions
    @GetMapping("/count")
    public long getTransactionCount() {
        return repo.count(); // Spring Data JPA provides a count() method
    }

    // 2️⃣ Create new transaction
    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction tx) {
        // TID: typed when the operator edits it, otherwise the server assigns the next sequence number
        String tid = tx.getTid();
        if (tid == null || tid.isBlank()) {
            tx.setTid(String.format("%06d", repo.nextTidValue()));
        } else if (tid.matches("\\d+")) {
            tx.setTid(String.format("%06d", Long.parseLong(tid)));
        }
        if (repo.existsById(tx.getTid())) {
            logger.warn("Transaction already exists: {}", tx.getTid());
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Transaction with this tid already exists"
            );
        }

        tx.setScale1(cleanScale(tx.getScale1()));
        tx.setScale2(cleanScale(tx.getScale2()));     

        return repo.save(tx);
    }

    // 3️⃣ Complete transaction (set lastWeight and netWeight)
    @PostMapping("/finalTransaction")
    public Map<String, String> completeTransaction(@RequestBody Transaction tx) {

        Transaction existing = repo.findByTid(tx.getTid())
                .orElseThrow(() ->{
                    logger.warn("Transaction not found. TID: {}", tx.getTid());
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found");
                });

        boolean alreadyDone = existing.getLastWeight() != null && existing.getLastWeight() > 0
            && existing.getNetWeight() != null && existing.getNetWeight() != 0;
        if (alreadyDone) {
            logger.warn("Transaction already completed. TID: {}", tx.getTid());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Transaction already completed");
        }


        existing.setLastWeight(tx.getLastWeight());
        existing.setNetWeight(tx.getNetWeight());
        existing.setOperator(tx.getOperator());
        existing.setSwDate(tx.getSwDate() != null ? tx.getSwDate() : OffsetDateTime.now());
        existing.setNwDate(tx.getNwDate() != null ? tx.getNwDate() : OffsetDateTime.now());

        String scale2 = cleanScale(tx.getScale2());
        if (scale2 != null) existing.setScale2(scale2);

        repo.save(existing);
        logger.info("Transaction completed successfully");
        return Map.of("message", "Transaction completed successfully");
    }

    @PostMapping("/testComplete")
    public Map<String,String> testComplete(@RequestBody Transaction tx) {
        logger.info("Endpoint hit!");
        return Map.of("message", "Hit successful");
    }

    // 4️⃣ Update transaction (all client info fields)
    @PutMapping("/update")
    public Transaction updateTransaction(@RequestBody Transaction tx) {
          if (tx.getTid() == null || tx.getTid().isBlank()) {
            logger.warn("Update failed: Missing Transaction ID");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction ID is required");
    }
        Transaction existing = repo.findById(tx.getTid()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        existing.setCompany(tx.getCompany());
        existing.setAddress(tx.getAddress());
        existing.setProduct(tx.getProduct());
        existing.setBatchNo(tx.getBatchNo());
        existing.setCarrier(tx.getCarrier());
        existing.setOperator(tx.getOperator());
        existing.setDest(tx.getDest());
        existing.setTel(tx.getTel());
        existing.setVehicleNo(tx.getVehicleNo());
        existing.setUnit(tx.getUnit());
        existing.setRemark(tx.getRemark());

        return repo.save(existing);
    }

    // 5️⃣ Delete transaction
    @DeleteMapping("/delete/{tid}")
    @Transactional
    @PreAuthorize("hasAuthority('superadmin')")
    public ResponseEntity<?> deleteTransaction(@PathVariable String tid) {

        Transaction existing = repo.findById(tid).orElseThrow(() -> {
            logger.warn("Delete failed. Transaction not found. TID: {}", tid);
            return new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found");
        });

        // Copy to deleted table
        DeletedTransaction deleted = new DeletedTransaction();

        deleted.setOriginalTid(existing.getTid());
        deleted.setFirstWeight(existing.getFirstWeight());
        deleted.setLastWeight(existing.getLastWeight());
        deleted.setTareWeight(existing.getTareWeight());
        deleted.setNetWeight(existing.getNetWeight());
        deleted.setGrossWeight(existing.getGrossWeight());
        deleted.setCompany(existing.getCompany());
        deleted.setAddress(existing.getAddress());
        deleted.setProduct(existing.getProduct());
        deleted.setCarrier(existing.getCarrier());
        deleted.setOperator(existing.getOperator());
        deleted.setDest(existing.getDest());
        deleted.setTel(existing.getTel());
        deleted.setVehicleNo(existing.getVehicleNo());
        deleted.setBatchNo(existing.getBatchNo());
        deleted.setOpsType(existing.getOpsType());
        deleted.setUnit(existing.getUnit());
        deleted.setFwDate(existing.getFwDate());
        deleted.setSwDate(existing.getSwDate());
        deleted.setTwDate(existing.getTwDate());
        deleted.setNwDate(existing.getNwDate());
        deleted.setGwDate(existing.getGwDate());
        deleted.setCapDate(existing.getCapDate());
        deleted.setScale1(existing.getScale1());
        deleted.setScale2(existing.getScale2());
        deleted.setRemark(existing.getRemark());
        deleted.setDeletedAt(OffsetDateTime.now());
        deleted.setDeletedBy(currentUsername());

        deletedRepo.save(deleted);

        // Delete original
        repo.delete(existing);

        logger.info("Transaction archived and deleted. TID: {}", tid);

        return ResponseEntity.ok().body(
            Map.of("message", "Transaction deleted and archived successfully")
        );
    }

    @PostMapping("/filter")
    public List<Transaction> filterTransactions(@RequestBody SearchRequest request) {

        String searchWord = request.getSearchWord();

        if (searchWord == null || searchWord.trim().isBlank()) {
            return repo.findAll();
        }

        return repo
            .findByVehicleNoContainingIgnoreCaseOrCompanyContainingIgnoreCaseOrTidContainingIgnoreCase(
                searchWord,
                searchWord,
                searchWord
            );
    }

    @GetMapping("/filter-by-id/{tid}")
    public Transaction getByTid(@PathVariable String tid) {
        return repo.findByTid(tid)
            .orElseThrow(() ->{
                logger.warn("Transaction not found for TID: {}", tid);
                return new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found");
    });
    }


    // 7️⃣ Filter transactions by date range (capDate)
    @PostMapping("/filter-by-date")
    public List<Transaction> filterByDate(@RequestBody DateRangeRequest request) {
        OffsetDateTime start = request.getStartDate();
        OffsetDateTime end = request.getEndDate();
        if (start == null && end == null) {
            logger.warn("Start date or end date required");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date or end date required");
        }

        if (start == null) start = OffsetDateTime.MIN;
        if (end == null) end = OffsetDateTime.MAX;

        return repo.findByCapDateBetween(start, end);
    }

    @GetMapping("/export")
        @PreAuthorize("hasAnyAuthority('superadmin', 'admin')")
    public void exportTransactions(HttpServletResponse response) throws IOException {
        List<Transaction> transactions = repo.findAll();

        // Put the check here
        if (transactions.isEmpty()) {
            response.sendError(
                HttpStatus.NOT_FOUND.value(),
                "No transactions available for export"
            );
            return;
        }

        // Set response headers
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=transactions.xlsx");

        // Create Excel workbook
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Transactions");

        // Header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"TID", "Company", "Address", "Product", "BatchNo", "Carrier", "Operator", "Dest", "Tel", "VehicleNo", "Unit", "IstCap", "SecCap", "TareCap", "NetCap", "GrossCap", "FWDate", "SWDate", "NWDate", "TWDate", "GWDate", "CapDate", "remark", "OpsType"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }

        // Data rows
        int rowIdx = 1;
      for (Transaction tx : transactions) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(tx.getTid());
            row.createCell(1).setCellValue(tx.getCompany() != null ? tx.getCompany() : "");
            row.createCell(2).setCellValue(tx.getAddress() != null ? tx.getAddress() : "");
            row.createCell(3).setCellValue(tx.getProduct() != null ? tx.getProduct() : "");
            row.createCell(4).setCellValue(tx.getBatchNo() != null ? tx.getBatchNo() : "");
            row.createCell(5).setCellValue(tx.getCarrier() != null ? tx.getCarrier() : "");
            row.createCell(6).setCellValue(tx.getOperator() != null ? tx.getOperator() : "");
            row.createCell(7).setCellValue(tx.getDest() != null ? tx.getDest() : "");
            row.createCell(8).setCellValue(tx.getTel() != null ? tx.getTel() : "");
            row.createCell(9).setCellValue(tx.getVehicleNo() != null ? tx.getVehicleNo() : "");
            row.createCell(10).setCellValue(tx.getUnit() != null ? tx.getUnit() : "");
            row.createCell(11).setCellValue(tx.getFirstWeight() != null ? tx.getFirstWeight() : 0);
            row.createCell(12).setCellValue(tx.getLastWeight() != null ? tx.getLastWeight() : 0);
            row.createCell(13).setCellValue(tx.getTareWeight() != null ? tx.getTareWeight() : 0);
            row.createCell(14).setCellValue(tx.getNetWeight() != null ? tx.getNetWeight() : 0);
            row.createCell(15).setCellValue(tx.getGrossWeight() != null ? tx.getGrossWeight() : 0);
            row.createCell(16).setCellValue(tx.getFwDate() != null ? tx.getFwDate().toString() : "");
            row.createCell(17).setCellValue(tx.getSwDate() != null ? tx.getSwDate().toString() : "");
            row.createCell(18).setCellValue(tx.getTwDate() != null ? tx.getTwDate().toString() : "");
            row.createCell(19).setCellValue(tx.getNwDate() != null ? tx.getNwDate().toString() : "");
            row.createCell(20).setCellValue(tx.getGwDate() != null ? tx.getGwDate().toString() : "");
            row.createCell(21).setCellValue(tx.getCapDate() != null ? tx.getCapDate().toString() : "");
            row.createCell(22).setCellValue(tx.getRemark() != null ? tx.getRemark().toString() : "");
            row.createCell(23).setCellValue(tx.getOpsType() != null ? tx.getOpsType() : "");
            row.createCell(24).setCellValue(tx.getScale1() != null ? tx.getScale1() : "");
            row.createCell(25).setCellValue(tx.getScale2() != null ? tx.getScale2() : "");
        }


        workbook.write(response.getOutputStream());
        workbook.close();
    }

    @GetMapping("/export-delete")
    @PreAuthorize("hasAuthority('superadmin')")
    public void exportDeletedTransaction(HttpServletResponse response) throws IOException {
        List<DeletedTransaction> transactions = deletedRepo.findAll();

        // Put the check here
         if (transactions.isEmpty()) {
            response.sendError(
                HttpStatus.NOT_FOUND.value(),
                "No deleted transactions available for export"
            );
            return;
        }

        // Set response headers
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=transactions.xlsx");

        // Create Excel workbook
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Deleted Transactions");

        // Header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"originalTid", "Company", "Address", "Product", "BatchNo", "Carrier", "Operator", "Dest", "Tel", "VehicleNo", "Unit", "IstCap", "SecCap", "TareCap", "NetCap", "GrossCap", "FWDate", "SWDate", "NWDate", "TWDate", "GWDate", "CapDate", "remark", "OpsType", "DeletedBy", "DeletedAt"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }

        // Data rows
        int rowIdx = 1;
      for (DeletedTransaction tx : transactions) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(tx.getTid());
            row.createCell(1).setCellValue(tx.getCompany() != null ? tx.getCompany() : "");
            row.createCell(2).setCellValue(tx.getAddress() != null ? tx.getAddress() : "");
            row.createCell(3).setCellValue(tx.getProduct() != null ? tx.getProduct() : "");
            row.createCell(4).setCellValue(tx.getBatchNo() != null ? tx.getBatchNo() : "");
            row.createCell(5).setCellValue(tx.getCarrier() != null ? tx.getCarrier() : "");
            row.createCell(6).setCellValue(tx.getOperator() != null ? tx.getOperator() : "");
            row.createCell(7).setCellValue(tx.getDest() != null ? tx.getDest() : "");
            row.createCell(8).setCellValue(tx.getTel() != null ? tx.getTel() : "");
            row.createCell(9).setCellValue(tx.getVehicleNo() != null ? tx.getVehicleNo() : "");
            row.createCell(10).setCellValue(tx.getUnit() != null ? tx.getUnit() : "");
            row.createCell(11).setCellValue(tx.getFirstWeight() != null ? tx.getFirstWeight() : 0);
            row.createCell(12).setCellValue(tx.getLastWeight() != null ? tx.getLastWeight() : 0);
            row.createCell(13).setCellValue(tx.getTareWeight() != null ? tx.getTareWeight() : 0);
            row.createCell(14).setCellValue(tx.getNetWeight() != null ? tx.getNetWeight() : 0);
            row.createCell(15).setCellValue(tx.getGrossWeight() != null ? tx.getGrossWeight() : 0);
            row.createCell(16).setCellValue(tx.getFwDate() != null ? tx.getFwDate().toString() : "");
            row.createCell(17).setCellValue(tx.getSwDate() != null ? tx.getSwDate().toString() : "");
            row.createCell(18).setCellValue(tx.getTwDate() != null ? tx.getTwDate().toString() : "");
            row.createCell(19).setCellValue(tx.getNwDate() != null ? tx.getNwDate().toString() : "");
            row.createCell(20).setCellValue(tx.getGwDate() != null ? tx.getGwDate().toString() : "");
            row.createCell(21).setCellValue(tx.getCapDate() != null ? tx.getCapDate().toString() : "");
            row.createCell(22).setCellValue(tx.getRemark() != null ? tx.getRemark().toString() : "");
            row.createCell(23).setCellValue(tx.getOpsType() != null ? tx.getOpsType() : "");
            row.createCell(24).setCellValue(tx.getDeletedBy() != null ? tx.getDeletedBy() : "");
            row.createCell(25).setCellValue(tx.getDeleteAt() != null ? tx.getDeleteAt().toString() : "");
            row.createCell(26).setCellValue(tx.getScale1() != null ? tx.getScale1() : "");
            row.createCell(27).setCellValue(tx.getScale2() != null ? tx.getScale2() : "");
        }


        workbook.write(response.getOutputStream());
        workbook.close();
    }



    // ✅ DTOs for filter requests
    public static class SearchRequest {
        private String searchWord;
        public String getSearchWord() { return searchWord; }
        public void setSearchWord(String searchWord) { this.searchWord = searchWord; }
    }

    public static class DateRangeRequest {
        private OffsetDateTime startDate;
        private OffsetDateTime endDate;
        public OffsetDateTime getStartDate() { return startDate; }
        public void setStartDate(OffsetDateTime startDate) { this.startDate = startDate; }
        public OffsetDateTime getEndDate() { return endDate; }
        public void setEndDate(OffsetDateTime endDate) { this.endDate = endDate; }
    }
}
