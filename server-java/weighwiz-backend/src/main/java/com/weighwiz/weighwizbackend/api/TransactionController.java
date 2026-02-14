package com.weighwiz.weighwizbackend.api;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.weighwiz.weighwizbackend.db.Transaction;
import com.weighwiz.weighwizbackend.db.TransactionRepository;

import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;


@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionRepository repo;

    public TransactionController(TransactionRepository repo) {
        this.repo = repo;
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
        if (repo.existsById(tx.getTid())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Transaction with this tid already exists"
            );
        }

        return repo.save(tx);
    }

    // 3️⃣ Complete transaction (set lastWeight and netWeight)
    @PostMapping("/finalTransaction")
    public Map<String, String> completeTransaction(@RequestBody Transaction tx) {

        Transaction existing = repo.findByTid(tx.getTid())
                .orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));


        existing.setLastWeight(tx.getLastWeight());
        existing.setNetWeight(tx.getNetWeight());
        existing.setSwDate(tx.getSwDate() != null ? tx.getSwDate() : OffsetDateTime.now());
        existing.setNwDate(tx.getNwDate() != null ? tx.getNwDate() : OffsetDateTime.now());

        repo.save(existing);

        return Map.of("message", "Transaction completed successfully");
    }

    @PostMapping("/testComplete")
    public Map<String,String> testComplete(@RequestBody Transaction tx) {
        System.out.println("Endpoint hit!");
        return Map.of("message", "Hit successful");
    }

    // 4️⃣ Update transaction (all client info fields)
    @PutMapping("/update")
    public Transaction updateTransaction(@RequestBody Transaction tx) {
          if (tx.getTid() == null || tx.getTid().isBlank()) {
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

        return repo.save(existing);
    }

    // 5️⃣ Delete transaction
    @DeleteMapping("/delete/{tid}")
    public String deleteTransaction(@PathVariable String tid) {
        Transaction existing = repo.findById(tid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        repo.delete(existing);
        return "Transaction deleted successfully";
    }

    // 6️⃣ Filter transactions by search term (vehicle, company, tid)
    @PostMapping("/filter")
    public List<Transaction> filterTransactions(@RequestBody SearchRequest request) {
        String term = request.getSearchWord();
        if (term == null || term.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Search term is required");
        }
        return repo.findByVehicleNoContainingIgnoreCaseOrCompanyContainingIgnoreCaseOrTidContainingIgnoreCase(term, term, term);
    }

    @GetMapping("/filter-by-id/{tid}")
    public Transaction getByTid(@PathVariable String tid) {
        return repo.findByTid(tid)
            .orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found")
            );
    }


    // 7️⃣ Filter transactions by date range (capDate)
    @PostMapping("/filter-by-date")
    public List<Transaction> filterByDate(@RequestBody DateRangeRequest request) {
        OffsetDateTime start = request.getStartDate();
        OffsetDateTime end = request.getEndDate();
        if (start == null && end == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date or end date required");
        }

        if (start == null) start = OffsetDateTime.MIN;
        if (end == null) end = OffsetDateTime.MAX;

        return repo.findByCapDateBetween(start, end);
    }

    @GetMapping("/export")
    public void exportTransactions(HttpServletResponse response) throws IOException {
        List<Transaction> transactions = repo.findAll();

        // Set response headers
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=transactions.xlsx");

        // Create Excel workbook
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Transactions");

        // Header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"TID", "Company", "Address", "Product", "BatchNo", "Carrier", "Operator", "Dest", "Tel", "VehicleNo", "Unit", "IstCap", "SecCap", "TareCap", "NetCap", "GrossCap", "FWDate", "SWDate", "NWDate", "TWDate", "GWDate", "CapDate", "OpsType"};
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
            row.createCell(22).setCellValue(tx.getOpsType() != null ? tx.getOpsType() : "");
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
