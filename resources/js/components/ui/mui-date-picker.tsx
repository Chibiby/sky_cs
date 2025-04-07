import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';

const StyledDatePicker = styled(MuiDatePicker)({
    '& .MuiInputBase-root': {
        width: '100%',
        fontFamily: 'inherit',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        height: '2.25rem',
        padding: '0',
        backgroundColor: 'transparent',
        '& .MuiInputBase-input': {
            width: '100%',
            padding: '0.375rem 0.75rem',
            paddingRight: '2.5rem',
            height: '2.25rem',
            color: 'inherit',
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
    return (
        <div className="w-full">
            <StyledDatePicker
                value={value}
                onChange={onChange}
                slotProps={{
                    textField: {
                        placeholder: "Pick a date",
                        fullWidth: true,
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