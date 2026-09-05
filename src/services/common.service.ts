import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonService {

  public baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  // ---------------------------------------------------------------
  // PRODUCTS  (api/Product/*)
  // ---------------------------------------------------------------

  /** All Products list -> GET api/Product/ItemList */
  GetAllProducts() {
    return this.http.get(`${this.baseUrl}/api/Product/ItemList`);
  }

  /** Add Product -> POST api/Product/SaveProduct */
  SaveProduct(data: any) {
    return this.http.post(`${this.baseUrl}/api/Product/SaveProduct`, data);
  }

  /**
   * API la GetProductById endpoint kidayadhu, so ItemList full data vaangi
   * andha Product_Code ku match aagura record ah client side la filter pannurom.
   */
  GetProductById(productCode: string) {
    return this.GetAllProducts().pipe(
      map((res: any) => {
        const list = res?.data || [];
        const match = list.find((x: any) => x.Product_Code === productCode);
        return {
          status: !!match,
          data: match ? [match] : []
        };
      })
    );
  }

  /** Update Product -> POST api/Product/UpdateProduct */
  UpdateProduct(data: any) {
    return this.http.post(`${this.baseUrl}/api/Product/UpdateProduct`, data);
  }

  /** Delete Product (soft delete) -> GET api/Product/DeleteProduct?Product_Code=... */
  DeleteProduct(productCode: string) {
    return this.http.get(`${this.baseUrl}/api/Product/DeleteProduct`, {
      params: { Product_Code: productCode }
    });
  }

  /** Stock list -> GET api/Product/StockList?Product_Code=... (optional) */
  GetProductStock(productCode?: string) {
    const params: any = {};
    if (productCode) { params.Product_Code = productCode; }
    return this.http.get(`${this.baseUrl}/api/Product/StockList`, { params });
  }

  /** Save/Update stock qty -> POST api/Product/SaveStock */
  SaveStock(data: any) {
    return this.http.post(`${this.baseUrl}/api/Product/SaveStock`, data);
  }

  // =================================================================
  // CATEGORY  (api/master/*Category*)
  // =================================================================

  GetAllCategories() {
    return this.http.get(`${this.baseUrl}/api/master/CategoryList`);
  }

  SaveCategory(data: any) {
    return this.http.post(`${this.baseUrl}/api/master/SaveCategory`, data);
  }

  UpdateCategory(data: any) {
    return this.http.post(`${this.baseUrl}/api/master/UpdateCategory`, data);
  }

  /** Soft delete -> Is_Active set to 'D' in backend */
  DeleteCategory(categoryCode: string) {
    return this.http.get(`${this.baseUrl}/api/master/DeleteCategory`, {
      params: { Category_Code: categoryCode }
    });
  }

  // =================================================================
  // GROUP / SUB CATEGORY  (api/master/*Group*)
  // =================================================================

  GetAllGroups() {
    return this.http.get(`${this.baseUrl}/api/master/GroupList`);
  }

  SaveGroup(data: any) {
    return this.http.post(`${this.baseUrl}/api/master/SaveGroup`, data);
  }

  UpdateGroup(data: any) {
    return this.http.post(`${this.baseUrl}/api/master/UpdateGroup`, data);
  }

  /** Soft delete -> Is_Active set to 'D' in backend */
  DeleteGroup(groupCode: string) {
    return this.http.get(`${this.baseUrl}/api/master/DeleteGroup`, {
      params: { Group_Code: groupCode }
    });
  }

  // =================================================================
  // BRAND  (api/master/*Brand*)
  // =================================================================

  GetAllBrands() {
    return this.http.get(`${this.baseUrl}/api/master/BrandList`);
  }

  SaveBrand(data: any) {
    return this.http.post(`${this.baseUrl}/api/master/SaveBrand`, data);
  }

  UpdateBrand(data: any) {
    return this.http.post(`${this.baseUrl}/api/master/UpdateBrand`, data);
  }

  /** Soft delete -> Is_Active set to 'D' in backend */
  DeleteBrand(brandCode: string) {
    return this.http.get(`${this.baseUrl}/api/master/DeleteBrand`, {
      params: { Brand_Code: brandCode }
    });
  }

  // =================================================================
  // UOM  (api/master/*Uom*)
  // =================================================================

  GetAllUnits() {
    return this.http.get(`${this.baseUrl}/api/master/UomList`);
  }

  SaveUom(data: any) {
    return this.http.post(`${this.baseUrl}/api/master/SaveUom`, data);
  }

  UpdateUom(data: any) {
    return this.http.post(`${this.baseUrl}/api/master/UpdateUom`, data);
  }

  /** Soft delete -> Is_Active set to 'D' in backend */
  DeleteUom(uomCode: string) {
    return this.http.get(`${this.baseUrl}/api/master/DeleteUom`, {
      params: { Uom_Code: uomCode }
    });
  }

  // =================================================================
  // HSN / GST  (api/master/*Hsn*)
  // =================================================================

  GetAllHsn() {
    return this.http.get(`${this.baseUrl}/api/master/HsnList`);
  }

  SaveHsn(data: any) {
    return this.http.post(`${this.baseUrl}/api/master/SaveHsn`, data);
  }

  UpdateHsn(data: any) {
    return this.http.post(`${this.baseUrl}/api/master/UpdateHsn`, data);
  }

  /** Soft delete -> Is_Active set to 'D' in backend */
  DeleteHsn(hsnCode: string) {
    return this.http.get(`${this.baseUrl}/api/master/DeleteHsn`, {
      params: { Hsn_Code: hsnCode }
    });
  }

  // ---------------------------------------------------------------
  // NOT AVAILABLE IN API IPPO (Supplier master & Tax/GST master table
  // Bot_Ecommerce_API la kidayadhu). 404 varama, empty array return
  // pannirom -- ng-select "All" mattum kaatum, UI break aagadhu.
  // Backend la intha 2 masters add pannina, indha methods ah real
  // http.get call ku maathi kudunga.
  // ---------------------------------------------------------------

  GetAllSuppliers() {
    return of({ status: true, data: [] });
  }

  GetAllTaxes() {
    return of({ status: true, data: [] });
  }

  GetAllWarrantyList() {
    return this.http.get(`${this.baseUrl}/api/Product/WarrantyList`);
  }

  GetAllColorList() {
    return this.http.get(`${this.baseUrl}/api/Product/ColorList`);
  }

  GetAllReorderLevelList() {
    return this.http.get(`${this.baseUrl}/api/Product/ReorderLevelList`);
  }

  GetAllTaxList() {
    return this.http.get(`${this.baseUrl}/api/Product/TaxList`);
  }

  GetAllUomList() {
    return this.http.get(`${this.baseUrl}/api/Product/UomList`);
  }


  GetAllGst() {
    return this.http.get(`${this.baseUrl}/api/master/GstList`);
  }

  SaveGst(data: any) {
    return this.http.post(`${this.baseUrl}/api/master/SaveGst`, data);
  }

  UpdateGst(data: any) {
    return this.http.post(`${this.baseUrl}/api/master/UpdateGst`, data);
  }

  DeleteGst(code: string) {
    return this.http.get(`${this.baseUrl}/api/master/DeleteGst`, {
      params: { Gst_Code: code }
    });
  }

  // -----------------------------------------------------------------------------------

  // --- Customers -----

  GetCustomerList() {
    return this.http.get(`${this.baseUrl}/api/customer/CustomerList`);
  }

  Get_CustomerReviewList() {
    return this.http.get(`${this.baseUrl}/api/customer/Get_CustomerReviewList`);
  }

 DeleteCustomerReview(reviewCode: string) {
  return this.http.get(
    `${this.baseUrl}/api/customer/DeleteCustomerReview`,
    {
      params: {
        Review_Code: reviewCode
      }
    }
  );
}
  


GetAllOrders() {
  return this.http.get(`${this.baseUrl}/api/order/AllOrders`);
}

OrderTracking(orderCode: string) {
  return this.http.get(`${this.baseUrl}/api/order/OrderTracking?Order_Code=${orderCode}`);
}

UpdateOrderStatus(body: any) {
  return this.http.post(`${this.baseUrl}/api/order/UpdateOrderStatus`, body);
}




GetItemStockList() {
  return this.http.get(`${this.baseUrl}/api/Stock/ItemStockList`);
}


GetStockList(productCode?: string) {
  const params: any = {};
  if (productCode) { params.Product_Code = productCode; }
  return this.http.get(`${this.baseUrl}/api/Stock/StockList`, { params });
}


GetStockByProduct(productCode: string) {
  return this.http.get(`${this.baseUrl}/api/Stock/StockByProduct`, {
    params: { Product_Code: productCode }
  });
}


AddStockQty(data: { Product_Code: string; Location_Code: string; Qty: number; Updated_By?: string }) {
  return this.http.post(`${this.baseUrl}/api/Stock/AddStock`, data);
}


ReduceStockQty(data: { Product_Code: string; Location_Code: string; Qty: number; Updated_By?: string }) {
  return this.http.post(`${this.baseUrl}/api/Stock/ReduceStock`, data);
}


SaveStockDirect(data: any) {
  return this.http.post(`${this.baseUrl}/api/Stock/SaveStock`, data);
}


DeleteStockRow(productCode: string, locationCode: string) {
  return this.http.get(`${this.baseUrl}/api/Stock/DeleteStock`, {
    params: { Product_Code: productCode, Location_Code: locationCode }
  });
}


GetCancelledOrderList(customerCode?: string, orderCode?: string) {
  const params: any = {};
  if (customerCode) { params.Customer_Code = customerCode; }
  if (orderCode) { params.Order_Code = orderCode; }
  return this.http.get(`${this.baseUrl}/api/order/CancelledOrderList`, { params });
}


GetReturnedOrderList(customerCode?: string, orderCode?: string) {
  const params: any = {};
  if (customerCode) { params.Customer_Code = customerCode; }
  if (orderCode) { params.Order_Code = orderCode; }
  return this.http.get(`${this.baseUrl}/api/order/ReturnedOrderList`, { params });
}


CancelOrder(data: any) {
  return this.http.post(`${this.baseUrl}/api/order/CancelOrder`, data);
}


ReturnOrderItem(data: any) {
  return this.http.post(`${this.baseUrl}/api/order/ReturnOrderItem`, data);
}


ProcessRefund(data: any) {
  return this.http.post(`${this.baseUrl}/api/order/ProcessRefund`, data);
}


OrderCancelReturnDetails(orderCode: string) {
  return this.http.get(`${this.baseUrl}/api/order/OrderCancelReturnDetails`, {
    params: { Order_Code: orderCode }
  });
}


MarkPaymentReceived(data: any) {
  return this.http.post(`${this.baseUrl}/api/order/MarkPaymentReceived`, data);
}




}