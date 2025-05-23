import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';
import { useState, useEffect, useRef } from 'react';

// Helper function to convert string to Date
const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    try {
        // Try standard Date parsing first
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) return date;
        
        // If that fails, try parsing common formats (MM/DD/YYYY or DD/MM/YYYY)
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            // Assume MM/DD/YYYY format (common in US)
            const month = parseInt(parts[0]) - 1;
            const day = parseInt(parts[1]);
            const year = parseInt(parts[2]);
            
            if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
                const newDate = new Date(year, month, day);
                if (!isNaN(newDate.getTime())) return newDate;
            }
            
            // Try DD/MM/YYYY format as fallback
            const monthAlt = parseInt(parts[1]) - 1;
            const dayAlt = parseInt(parts[0]);
            
            if (!isNaN(monthAlt) && !isNaN(dayAlt)) {
                const newDateAlt = new Date(year, monthAlt, dayAlt);
                if (!isNaN(newDateAlt.getTime())) return newDateAlt;
            }
        }
    } catch (e) {
        console.error("Error parsing date string:", e);
    }
    
    return null;
};

const StyledDatePicker = styled(MuiDatePicker)({
    '& .MuiInputBase-root': {
        width: '70%',
        fontFamily: 'inherit',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        height: '2.25rem',
        padding: '0',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        '& .MuiInputBase-input': {
            width: '100%',
            padding: '0.375rem 0.75rem',
            paddingRight: '2.5rem',
            height: '2.25rem',
            color: 'inherit',
            cursor: 'pointer',
            userSelect: 'none',
            '&::placeholder': {
                color: 'var(--muted-foreground)',
                opacity: 1,
            },
        },
        '& .MuiInputAdornment-root': {
            position: 'absolute',
            right: '1.5rem',
            height: '100%',
            maxHeight: 'none',
            pointerEvents: 'none',
            '& .MuiButtonBase-root': {
                padding: '4px',
            },
            '& .MuiSvgIcon-root': {
                fontSize: '1.25rem',
            },
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--input)',
            borderRadius: '0.375rem',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--input)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--ring)',
            borderWidth: '1px',
            boxShadow: '0 0 0 1px var(--ring)',
        },
    },
}) as typeof MuiDatePicker;

interface DatePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Debug the value being passed to the component
    useEffect(() => {
        console.log('DatePicker value:', value);
        console.log('DatePicker value type:', value ? typeof value : 'null');
        
        // If we have a string instead of a Date object, try to convert it
        if (value && typeof value === 'string') {
            const dateObj = parseDate(value);
            if (dateObj) {
                console.log('Converting string to Date:', dateObj);
                onChange(dateObj);
            }
        }
    }, [value]);
    
    // Watch for changes in the input element value
    useEffect(() => {
        // Only run this effect on the client side
        if (typeof window === 'undefined') return;
        
        const checkInputValue = () => {
            if (inputRef.current && inputRef.current.value && !value) {
                console.log('Input has value but form state does not:', inputRef.current.value);
                const dateObj = parseDate(inputRef.current.value);
                if (dateObj) {
                    console.log('Setting date from input value:', dateObj);
                    onChange(dateObj);
                }
            }
        };
        
        // Check initially and then periodically
        checkInputValue();
        const interval = setInterval(checkInputValue, 1000);
        
        return () => clearInterval(interval);
    }, [value, onChange]);
    
    const handleDateChange = (newDate: Date | null) => {
        console.log('DatePicker change:', newDate);
        // Ensure we're passing a valid Date object to onChange
        if (newDate === null || (newDate instanceof Date && !isNaN(newDate.getTime()))) {
            onChange(newDate);
        } else if (typeof newDate === 'string') {
            const dateObj = parseDate(newDate);
            if (dateObj) {
                onChange(dateObj);
            } else {
                console.error('Invalid date string:', newDate);
                onChange(null);
            }
        } else {
            console.error('Invalid date selected:', newDate);
            onChange(null);
        }
    };

    return (
        <div className="w-full">
            <StyledDatePicker
                value={value}
                onChange={handleDateChange}
                open={isOpen}
                onOpen={() => setIsOpen(true)}
                onClose={() => setIsOpen(false)}
                slotProps={{
                    textField: {
                        placeholder: "Pick a date",
                        fullWidth: true,
                        inputProps: {
                            readOnly: true,
                            ref: inputRef
                        },
                        onClick: () => setIsOpen(true),
                    },
                    popper: {
                        placement: "bottom-start",
                        style: { zIndex: 9999 }
                    }
                }}
            />
        </div>
    );
} 