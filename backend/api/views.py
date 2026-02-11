from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Vendor, Department, Status, Category, Product, TransferLog, RepairStatus, RepairLog
from .serializers import VendorSerializer, DepartmentSerializer, StatusSerializer, CategorySerializer, ProductSerializer, TransferLogSerializer, RepairStatusSerializer, RepairLogSerializer

import io
import pandas as pd
from django.http import HttpResponse
from rest_framework.views import APIView
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from openpyxl import load_workbook
from openpyxl.styles import Font, Alignment
from openpyxl.utils import get_column_letter


class VendorViewSet(ModelViewSet):
    queryset = Vendor.objects.all().order_by("-created_at")
    serializer_class = VendorSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class DepartmentViewSet(ModelViewSet):
    queryset = Department.objects.all().order_by("-created_at")
    serializer_class = DepartmentSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class StatusViewSet(ModelViewSet):
    queryset = Status.objects.filter(is_active=True).order_by("name")
    serializer_class = StatusSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.filter(is_active=True).order_by("name")
    serializer_class = CategorySerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])

class ProductViewSet(ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related(
        "vendor", "current_department", "status"
    ).order_by("-created_at")
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "category", "current_department"]
    search_fields = ["name", "model_number"]
    ordering_fields = ["created_at", "name", "price"]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])



# Excel Export
class ProductExportExcelView(APIView):

    def post(self, request, *args, **kwargs):
        filters = request.data
        qs = Product.objects.filter(is_active=True)

        # Apply filters
        search = filters.get("search")
        status = filters.get("status")
        category = filters.get("category")
        department = filters.get("department")
        ordering = filters.get("ordering", "-created_at")

        if search:
            qs = qs.filter(name__icontains=search)
        if status:
            qs = qs.filter(status_id=status)
        if category:
            qs = qs.filter(category_id=category)
        if department:
            qs = qs.filter(current_department_id=department)

        qs = qs.order_by(ordering)

        # Prepare DataFrame
        data = []
        for p in qs:
            data.append({
                "Name": p.name,
                "Model Number": p.model_number,
                "Description": p.description,
                "Category": p.category.name if p.category else "",
                "Department": p.current_department.name if p.current_department else "",
                "Vendor": p.vendor.name if p.vendor else "",
                "Price": float(p.price),
                "Quantity": p.quantity,
                "Purchase Date": p.purchase_date.strftime("%d-%m-%Y") if p.purchase_date else "",
                "Warranty": f"{p.warranty_years} years" if p.warranty_years else "",
                "Warranty End": p.warranty_end_date.strftime("%d-%m-%Y") if p.warranty_end_date else "",
                "Status": p.status.name if p.status else "",
                "Created At": p.created_at.strftime("%d-%m-%Y %H:%M:%S"),
                "Updated At": p.updated_at.strftime("%d-%m-%Y %H:%M:%S"),
            })

        df = pd.DataFrame(data)

        # Create Excel
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Products")
            sheet = writer.book["Products"]

            # Style header
            header_font = Font(bold=True)
            for cell in sheet[1]:
                cell.font = header_font
                cell.alignment = Alignment(horizontal="center")

            # Auto column width
            for col in sheet.columns:
                max_length = 0
                col_letter = get_column_letter(col[0].column)
                for cell in col:
                    try:
                        max_length = max(max_length, len(str(cell.value)))
                    except:
                        pass
                sheet.column_dimensions[col_letter].width = max_length + 4

            # Freeze header
            sheet.freeze_panes = "A2"

        buffer.seek(0)

        response = HttpResponse(
            buffer,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = "attachment; filename=products.xlsx"
        return response


# PDF Export
class ProductExportPDFView(APIView):

    def post(self, request, *args, **kwargs):
        filters = request.data
        qs = Product.objects.filter(is_active=True)

        # Apply filters
        search = filters.get("search")
        status = filters.get("status")
        category = filters.get("category")
        department = filters.get("department")
        ordering = filters.get("ordering", "-created_at")

        if search:
            qs = qs.filter(name__icontains=search)
        if status:
            qs = qs.filter(status_id=status)
        if category:
            qs = qs.filter(category_id=category)
        if department:
            qs = qs.filter(current_department_id=department)

        qs = qs.order_by(ordering)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            leftMargin=20,
            rightMargin=20,
            topMargin=60,
            bottomMargin=20
        )

        styles = getSampleStyleSheet()
        elements = []

        # Title
        title = Paragraph("Products Report", styles["Title"])
        elements.append(title)
        elements.append(Spacer(1, 12))

        # Table Data
        data = []
        headers = ["SL No","Name", "Category", "Department", "Vendor", "Price", "Purchase Date", "Warranty", "Warranty End", "Status"]
        data.append(headers)

        for i, prod in enumerate(qs, start=1):
            row = [
                i,
                prod.name,
                prod.category.name if prod.category else "",
                prod.current_department.name if prod.current_department else "",
                prod.vendor.name if prod.vendor else "",
                f"{prod.price:.2f}",
                prod.purchase_date.strftime("%d-%m-%Y") if prod.purchase_date else "",
                f"{prod.warranty_years} years" if prod.warranty_years else "",
                prod.warranty_end_date.strftime("%d-%m-%Y") if prod.warranty_end_date else "",
                prod.status.name if prod.status else "",
            ]
            data.append(row)

        

        table = Table(data, repeatRows=1)
        style = TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 12),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ])
        # Alternating row colors
        for i in range(1, len(data)):
            if i % 2 == 0:
                style.add("BACKGROUND", (0, i), (-1, i), colors.whitesmoke)
        table.setStyle(style)
        elements.append(table)

        # Header & Footer
        def header_footer(canvas_obj, doc_obj):
            canvas_obj.saveState()
            # Header (hospital name)
            canvas_obj.setFont("Helvetica-Bold", 14)
            canvas_obj.drawString(30, doc_obj.pagesize[1] - 40, "Feni Diabetes Hospital")
            # Footer (page number)
            page_num_text = f"Page {doc_obj.page}"
            canvas_obj.setFont("Helvetica", 9)
            canvas_obj.drawRightString(doc_obj.pagesize[0] - 30, 20, page_num_text)
            canvas_obj.restoreState()

        doc.build(elements, onFirstPage=header_footer, onLaterPages=header_footer)

        buffer.seek(0)
        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = "attachment; filename=products.pdf"
        return response



class TransferLogViewSet(ModelViewSet):
    queryset = TransferLog.objects.select_related(
        "product", "from_department", "to_department"
    ).order_by("-created_at")
    serializer_class = TransferLogSerializer

    def perform_create(self, serializer):
        transfer = serializer.save()
        if transfer.product:
            transfer.product.current_department = transfer.to_department
            transfer.product.save()

class RepairStatusViewSet(ModelViewSet):
    queryset = RepairStatus.objects.filter(is_active=True).order_by("name")
    serializer_class = RepairStatusSerializer

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class RepairLogViewSet(ModelViewSet):
    queryset = RepairLog.objects.select_related(
        "product", "status"
    ).order_by("-created_at")
    serializer_class = RepairLogSerializer

    def perform_update(self, serializer):
        repair = serializer.save()

        if repair.product and repair.status and repair.status.product_status:
            repair.product.status = repair.status.product_status
            repair.product.save()
