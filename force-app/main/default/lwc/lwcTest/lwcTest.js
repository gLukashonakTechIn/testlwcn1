import {LightningElement, track, wire} from 'lwc';
import getContacts from '@salesforce/apex/LWCController.getContacts';
import delSelectedCons from '@salesforce/apex/LWCController.deleteContacts';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';


const columns = [
    {
        label: 'FirstName',
        fieldName: 'FirstName'
    }, {
        label: 'LastName',
        fieldName: 'LastName'
    }, {
        label: 'Phone',
        fieldName: 'Phone',
        type: 'phone'
    }, {
        label: 'Email',
        fieldName: 'Email',
        type: 'email'
    }
];


export default class lwcTest extends LightningElement {
    @track data;
    @track columns = columns;
    @track buttonLabel = 'Delete Selected Contacts';
    @track isTrue = false;
    @track recordsCount = 0;
    selectedRecords = [];
    refreshTable;
    error;
    @wire(getContacts)
    contacts(result) {
        this.refreshTable = result;
        if (result.data) {
            this.data = result.data;
            this.error = undefined;

        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }


    getSelectedRecords(event) {
        const selectedRows = event.detail.selectedRows;
        this.recordsCount = event.detail.selectedRows.length;
        let conIds = new Set();
        for (let i = 0; i < selectedRows.length; i++) {
            conIds.add(selectedRows[i].Id);
        }
        this.selectedRecords = Array.from(conIds);

        window.console.log('selectedRecords ====> ' +this.selectedRecords);
    }

    deleteAccounts() {
        if (this.selectedRecords) {
            this.buttonLabel = 'Processing....';
            this.isTrue = true;
            this.deleteCons();
        }
    }


    deleteCons() {
        delSelectedCons({lstConIds: this.selectedRecords})
        .then(result => {
            window.console.log('result ====> ' + result);
            this.buttonLabel = 'Delete Selected Contacts';
            this.isTrue = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success!!', 
                    message: this.recordsCount + ' Contacts are deleted.', 
                    variant: 'success'
                }),
            );
            
            this.template.querySelector('lightning-datatable').selectedRows = [];
            this.recordsCount = 0;
            return refreshApex(this.refreshTable);

        })
        .catch(error => {
            window.console.log(error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while getting Contacts', 
                    message: error.message, 
                    variant: 'error'
                }),
            );
        });
    }  

}